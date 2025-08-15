import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BoltContractSBTCService } from '../../libs/bolt-contract-sbtc.service';
import { Advertisement, AdvertisementStatus } from '../models/advertisement.model';

export interface CreateAdvertisementRequest {
    amountInSats: bigint
    price: bigint
}

export interface GetAdvertisementsParams {
    status?: AdvertisementStatus[];
    active_only?: boolean;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface AdvertisementsPagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface AdvertisementsResponse {
    data: Advertisement[];
    pagination: AdvertisementsPagination;
}

@Injectable({ providedIn: 'root' })
export class AdvertisementService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private boltContractSBTCService = inject(BoltContractSBTCService);

  constructor() {
    console.log('AdvertisementService initialized with apiUrl:', this.apiUrl); // Debug log
    console.log('Environment:', environment); // Debug log
  }

  createAdvertisement(request: CreateAdvertisementRequest): Observable<Advertisement> {
    const recipient = environment.b2pixAddress;

    // First call the Bolt contract transfer, then chain the HTTP post
    return this.boltContractSBTCService.transferStacksToBolt(request.amountInSats, recipient, request.price.toString()).pipe(
      switchMap((transactionSerialized) => {
        console.log('Signed successful:', transactionSerialized);
        return this.http.post<Advertisement>(`${this.apiUrl}/v1/advertisements`, {
          transaction: transactionSerialized
        });
      }),
      catchError((transferError: any) => {
        console.error('Erro na transferência:', transferError);
        return throwError(() => transferError);
      })
    );
  }

  /**
   * Get advertisements with optional filtering and pagination
   * @param params Query parameters for filtering and pagination
   * @returns Observable of advertisements response with pagination
   */
  getAdvertisements(params?: GetAdvertisementsParams): Observable<AdvertisementsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      // Add status filter (can be multiple) - try standard array notation
      if (params.status && params.status.length > 0) {
        params.status.forEach(status => {
          httpParams = httpParams.append('status[]', status);
        });
        console.log('Added status filters:', params.status); // Debug log
      }

      // Add active_only filter
      if (params.active_only !== undefined) {
        httpParams = httpParams.set('active_only', params.active_only.toString());
        console.log('Added active_only filter:', params.active_only); // Debug log
      }

      // Add pagination parameters
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }

      if (params.limit !== undefined) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }

      // Add sorting parameters
      if (params.sort_by) {
        httpParams = httpParams.set('sort_by', params.sort_by);
      }

      if (params.sort_order) {
        httpParams = httpParams.set('sort_order', params.sort_order);
      }
    }

    const url = `${this.apiUrl}/v1/advertisements`;
    return this.http.get<AdvertisementsResponse>(url, { params: httpParams });
  }

  /**
   * Get advertisements with ready status only
   * @param activeOnly Whether to filter only active advertisements
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Observable of ready advertisements
   */
  getReadyAdvertisements(activeOnly: boolean = true, page: number = 1, limit: number = 10): Observable<AdvertisementsResponse> {
    return this.getAdvertisements({
      status: [AdvertisementStatus.READY],
      active_only: activeOnly,
      page,
      limit
    });
  }

  getAdvertisementById(id: string): Observable<Advertisement> {
    return this.http.get<Advertisement>(`${this.apiUrl}/v1/advertisements/${id}`);
  }

  updateAdvertisement(id: string, advertisement: Advertisement): Observable<Advertisement> {
    return this.http.put<Advertisement>(`${this.apiUrl}/v1/advertisements/${id}`, advertisement);
  }

  deleteAdvertisement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/v1/advertisements/${id}`);
  }
}