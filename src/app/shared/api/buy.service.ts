import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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

}