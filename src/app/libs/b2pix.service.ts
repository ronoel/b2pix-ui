import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface SendInviteRequest {
  address: string;
  publicKey: string;
  signature: string;
  payload: string;
}

export interface SendInviteResponse {
  code: string;
  status: string;
}

export interface ClaimInviteRequest {
  address: string;
  publicKey: string;
  signature: string;
  payload: string;
}

export interface ClaimInviteResponse {
  code: string;
  status: string;
  claimed_at?: string;
  address?: string;
}

export interface InviteInfo {
  code: string;
  status: string;
  username: string;
  email: string;
  created_at: string;
  claimed_at?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class B2pixService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private inviteCache = new Map<string, InviteInfo>();

  sendInvite(data: SendInviteRequest): Observable<SendInviteResponse> {
    return this.http.post<SendInviteResponse>(`${this.apiUrl}/v1/invites/send`, data);
  }

  claimInvite(data: ClaimInviteRequest): Observable<ClaimInviteResponse> {
    return this.http.post<ClaimInviteResponse>(`${this.apiUrl}/v1/invites/claim`, data).pipe(
      tap(() => {
        // Clear cache when claiming an invite as the status might change
        this.inviteCache.clear();
      })
    );
  }

  getInviteByCode(code: string): Observable<InviteInfo> {
    return this.http.get<InviteInfo>(`${this.apiUrl}/v1/invites/code/${code}`);
  }

  getInviteByAddress(address: string): Observable<InviteInfo> {
    // Check if we have cached result for this address
    if (this.inviteCache.has(address)) {
      return of(this.inviteCache.get(address)!);
    }

    // If not cached, make HTTP request and cache the result
    return this.http.get<InviteInfo>(`${this.apiUrl}/v1/invites/address/${address}`).pipe(
      tap(invite => {
        this.inviteCache.set(address, invite);
      })
    );
  }

  /**
   * Clear the invite cache - useful when user logs out or needs fresh data
   */
  clearInviteCache(): void {
    this.inviteCache.clear();
  }

  /**
   * Clear cached invite for specific address
   */
  clearInviteCacheForAddress(address: string): void {
    this.inviteCache.delete(address);
  }
} 