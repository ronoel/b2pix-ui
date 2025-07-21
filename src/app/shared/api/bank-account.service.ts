import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WalletService } from '../../libs/wallet.service';

export interface SetBankCredentialsRequest {
  signature: string;
  publicKey: string;
  payload: string;
}

export interface SetBankCredentialsResponse {
  message: string;
}

export interface SetCertificateRequest {
  signature: string;
  publicKey: string;
  payload: string;
  certificate: string; // base64 encoded .p12 file
  filename: string;    // must end with .p12
}

export interface SetCertificateResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class BankAccountService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private walletService = inject(WalletService);

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  setBankCredentials(clientId: string, secretKey: string): Observable<SetBankCredentialsResponse> {
    const address = this.walletService.getSTXAddress();
    const payload = `B2PIX - Definir Credenciais Bancárias\n${environment.domain}\n${address}\n${clientId}\n${secretKey}\n${this.getTimestamp()}`;
    return from(this.walletService.signMessage(payload)).pipe(
      switchMap(signedMessage => {
        const data: SetBankCredentialsRequest = {
          publicKey: signedMessage.publicKey,
          signature: signedMessage.signature,
          payload
        };
        return this.http.post<SetBankCredentialsResponse>(`${this.apiUrl}/v1/invites/credentials`, data);
      })
    );
  }

  setCertificate(certificateBase64: string, filename: string): Observable<SetCertificateResponse> {
    const address = this.walletService.getSTXAddress();
    const payload = `B2PIX - Definir Certificado\n${environment.domain}\n${address}\n${this.getTimestamp()}`;
    return from(this.walletService.signMessage(payload)).pipe(
      switchMap(signedMessage => {
        const data: SetCertificateRequest = {
          publicKey: signedMessage.publicKey,
          signature: signedMessage.signature,
          payload,
          certificate: certificateBase64,
          filename
        };
        return this.http.post<SetCertificateResponse>(`${this.apiUrl}/v1/invites/certificate`, data);
      })
    );
  }
}
