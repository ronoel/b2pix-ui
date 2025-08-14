import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BoltContractSBTCService } from '../../libs/bolt-contract-sbtc.service';

export enum AdvertisementStatus {
    /** Advertisement created, not yet validated or funded */
    DRAFT = 'draft',
    /** Advertisement waiting the transaction confirmation */
    PENDING = 'pending',
    /** Advertisement validated and with funds available */
    READY = 'ready',
    /** Failed to validate bank account or PIX key for receiving */
    BANK_FAILED = 'bank_failed',
    /** Failed to receive the expected deposit/funding */
    DEPOSIT_FAILED = 'deposit_failed',
    /** Advertisement closed (manually or by fund exhaustion) */
    CLOSED = 'closed',
    /** Advertisement paused by user action or moderation */
    DISABLED = 'disabled'
}

export interface Advertisement {
  id: string;
  seller_address: string;
  token: string;
  currency: string;
  price: bigint;
  amount_fund: bigint;
  remaining_fund: bigint;
  status: AdvertisementStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAdvertisementRequest {
    amountInSats: bigint
    price: bigint
}

@Injectable({ providedIn: 'root' })
export class AdvertisementService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private boltContractSBTCService = inject(BoltContractSBTCService);

  getAdvertisements(): Observable<Advertisement[]> {
    return this.http.get<Advertisement[]>(`${this.apiUrl}/v1/advertisements`);
  }

  getAdvertisementById(id: string): Observable<Advertisement> {
    return this.http.get<Advertisement>(`${this.apiUrl}/v1/advertisements/${id}`);
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

  updateAdvertisement(id: string, advertisement: Advertisement): Observable<Advertisement> {
    return this.http.put<Advertisement>(`${this.apiUrl}/v1/advertisements/${id}`, advertisement);
  }

  deleteAdvertisement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/v1/advertisements/${id}`);
  }
}