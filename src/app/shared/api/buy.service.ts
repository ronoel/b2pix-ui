import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from "../../../environments/environment";
import { WalletService } from '../../libs/wallet.service';
import { Buy } from "../models/buy.model";
import { SignedRequest } from "../models/api.model";


@Injectable({ providedIn: 'root' })
export class BuyService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private walletService = inject(WalletService);

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Start a buy order with wallet signature
   */
  startBuy(payValue: number, advertisementId: string): Observable<Buy> {
    const addressBuy = this.walletService.getSTXAddress();
    const payload = `B2PIX - Comprar\n${environment.domain}\n${payValue}\n${addressBuy}\n${advertisementId}\n${this.getTimestamp()}`;

    return from(this.walletService.signMessage(payload)).pipe(
      switchMap(signedMessage => {
        const data: SignedRequest = {
          publicKey: signedMessage.publicKey,
          signature: signedMessage.signature,
          payload
        };
        return this.http.post<Buy>(`${this.apiUrl}/v1/buys`, data);
      })
    );
  }

  /**
   * Get a buy order by ID
   */
  getBuyById(id: string): Observable<Buy> {
    return this.http.get<Buy>(`${this.apiUrl}/v1/buys/${id}`);
  }

  /**
   * Get buy orders by advertisement ID
   */
  getBuysByAdvertisementId(advertisementId: string): Observable<Buy[]> {
    return this.http.get<Buy[]>(`${this.apiUrl}/v1/buys/advertisement/${advertisementId}`);
  }

  /**
   * Mark a buy order as paid with wallet signature
   */
  markBuyAsPaid(buyId: string, pixId?: string): Observable<Buy> {
    const pixIdValue = pixId || "NONE";
    const payload = `B2PIX - Marcar como Pago\n${environment.domain}\n${pixIdValue}\n${buyId}\n${this.getTimestamp()}`;
    
    console.log('markBuyAsPaid called with:', { buyId, pixId, pixIdValue });
    console.log('Payload to sign:', payload);

    return from(this.walletService.signMessage(payload)).pipe(
      switchMap(signedMessage => {
        console.log('Message signed successfully:', signedMessage);
        
        const data: SignedRequest = {
          publicKey: signedMessage.publicKey,
          signature: signedMessage.signature,
          payload
        };
        
        console.log('Sending request to API:', data);
        console.log('API URL:', `${this.apiUrl}/v1/buys/${buyId}/paid`);
        
        return this.http.put<Buy>(`${this.apiUrl}/v1/buys/${buyId}/paid`, data);
      }),
      catchError((error: any) => {
        console.error('Error in markBuyAsPaid:', error);
        if (error.message && error.message.includes('User denied')) {
          throw new Error('Assinatura cancelada pelo usuário');
        }
        throw error;
      })
    );
  }

}