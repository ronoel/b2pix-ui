import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class B2PIXService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;


  sendTransaction(serializedTx: any): Observable<any> {

    return this.http.post(

      // B2PIX API
      `${this.apiUrl}/v1/advertisements`,
      { address_sell: 'address-test', token: 'sBTC', currency: 'BRL', price: 50, amount: 100, transaction: serializedTx}

      // `http://localhost:3000/api/v1/transaction/b2pix`,
      // { serializedTx }

      // BOLT PROTOCOL API
      // `${this.apiUrl}/transaction/${environment.supportedAsset.sBTC.contractToken}`,
      // { serializedTx },
      // { headers: this.getClientHeaders() }
    );
  }
}