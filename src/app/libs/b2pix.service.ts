import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { WalletService } from './wallet.service';

const SIGNATURE_DOMAIN = 'b2pix.org';

export interface SendInviteRequest {
  publicKey: string;
  signature: string;
  payload: string;
}

export interface SendInviteResponse {
  code: string;
  status: string;
}

export interface ClaimInviteRequest {
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

// export function sentInvitePayload(email: string): string {
//   const isoDate = new Date().toISOString();
//   return `B2PIX - Enviar Convite\n${SIGNATURE_DOMAIN}\n${email}\n${isoDate}`;
// }

@Injectable({ providedIn: 'root' })
export class B2pixService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private inviteCache = new Map<string, InviteInfo>();

  private walletService = inject(WalletService);

  private createPayloadSendInvite(email: string): string {
    return `B2PIX - Enviar Convite\n${SIGNATURE_DOMAIN}\n${email}\n${this.getTimestamp()}`;
  }

  sendInvite(email: string): Observable<SendInviteResponse> {

    const payload = this.createPayloadSendInvite(email);

    // Use from to convert Promise to Observable, then chain the observables
    return from(this.walletService.signMessage(payload)).pipe(
      switchMap(signedMessage => {
        const data: SendInviteRequest = {
          publicKey: signedMessage.publicKey,
          signature: signedMessage.signature,
          payload
        };
        return this.http.post<SendInviteResponse>(`${this.apiUrl}/v1/invites/send`, data);
      })
    );
  }

  private createPayloadClaimInvite(inviteCode: string, username: string): string {
    return `B2PIX - Resgatar Convite\n${SIGNATURE_DOMAIN}\n${inviteCode}\n${username}\n${this.walletService.getSTXAddress()}\n${this.getTimestamp()}`;
  }

  claimInvite(inviteCode: string, username: string): Observable<ClaimInviteResponse> {

    const payload = this.createPayloadClaimInvite(inviteCode, username);

    // Use from to convert Promise to Observable, then chain the observables
    return from(this.walletService.signMessage(payload)).pipe(
      switchMap(signedMessage => {
        const data: ClaimInviteRequest = {
          publicKey: signedMessage.publicKey,
          signature: signedMessage.signature,
          payload
        };
        return this.http.post<ClaimInviteResponse>(`${this.apiUrl}/v1/invites/claim`, data).pipe(
          tap(() => {
            // Clear cache when claiming an invite as the status might change
            this.inviteCache.clear();
          })
        );
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

  private getTimestamp(): string {
    return new Date().toISOString();
  }
} 