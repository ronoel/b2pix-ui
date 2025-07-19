import { computed, Signal, WritableSignal, signal, Injectable, inject } from '@angular/core';
import { AppConfig, openSignatureRequestPopup, UserData, UserSession } from '@stacks/connect';
import { showConnect } from '@stacks/connect';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { B2pixService } from './b2pix.service';
import { routes } from '../app.routes';
import { Router } from '@angular/router';

const appConfig = new AppConfig(['store_write', 'publish_data']);

const myAppName = 'BoltProto'; // shown in wallet pop-up
const myAppIcon = 'https://storage.googleapis.com/bitfund/boltproto-icon.png'; // shown in wallet pop-up
/**
 * Service responsible for managing the user's wallet and authentication status.
 */
@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private readonly userSession = new UserSession({ appConfig });
  readonly isLoggedInSignal = signal(false);
  readonly userDataSignal: WritableSignal<UserData | null> = signal<UserData | null>(null);
  readonly network = environment.network;
  private router = inject(Router);

  readonly walletAddressSignal: Signal<string | null> = computed(() => {
    const userData = this.userDataSignal();
    if (!userData) return null;
    return userData.identityAddress || null;
  });

  constructor() {
    this.checkAuth();
    console.log('Wallet Service environment', environment.network);
  }

  /**
   * Checks if the user is authenticated and updates the `isLoggedInSignal` accordingly.
   */
  private checkAuth() {
    if (this.userSession.isUserSignedIn()) {
      this.isLoggedInSignal.set(true);
      this.userDataSignal.set(this.userSession.loadUserData());
    } else {
      this.isLoggedInSignal.set(false);
      this.userDataSignal.set(null);
    }
  }

  /**
   * Initiates the sign-in process for the user.
   * If the user is already signed in, it logs a message and returns.
   * If the user is not signed in, it shows a connect pop-up and updates the `isLoggedInSignal` when finished.
   */
  public signIn() {
    if (this.isLoggedInSignal()) {
      return;
    }
    showConnect({
      appDetails: {
        name: myAppName,
        icon: myAppIcon,
      },
      // redirectTo: '/',
      onFinish: () => {
        this.isLoggedInSignal.set(true);
        this.userDataSignal.set(this.userSession.loadUserData());
      },
      onCancel: () => {
        console.log('User cancelled'); // WHEN user cancels/closes pop-up
      }
    });
  }

  /**
   * Signs out the user if they are signed in.
   * If the user is not signed in, it logs a message and returns.
   */
  public signOut() {
    if (!this.isLoggedInSignal()) {
      return;
    }
    
    this.userSession.signUserOut();
    this.isLoggedInSignal.set(false);
    this.userDataSignal.set(null);
    this.router.navigate(['/']);
  }

  /**
   * Checks if the user is currently signed in.
   * @returns `true` if the user is signed in, `false` otherwise.
   */
  public isLoggedIn() {
    return this.isLoggedInSignal();
  }

  /**
   * Retrieves the user data of the currently signed-in user.
   * @returns The user data.
   */
  public getUserData(): UserData | null {
    return this.userDataSignal();
  }

  /**
   * Retrieves the identity address of the currently signed-in user.
   * @returns The identity address.
   */
  public getIdentityAddress() {
    return this.userDataSignal()?.identityAddress || null;
  }

  /**
   * Retrieves the STX address of the currently signed-in user.
   * @returns The STX address.
   */
  public getSTXAddress() {
    const userData = this.userDataSignal();
    if (!userData) return null;
    return environment.network === 'mainnet'
      ? userData.profile.stxAddress.mainnet
      : userData.profile.stxAddress.testnet;
  }

  public getNetwork() {
    return this.network;
  }

  public getApiUrl() {
    return environment.blockchainAPIUrl;
  }

  /**
   * Retrieves the balance of STX tokens in the user's wallet.
   * @returns An Observable that emits the balance of STX tokens.
   */
  public getSTXBalance(): Observable<number> {
    const address = this.getSTXAddress();
    return new Observable<number>((observer) => {
      fetch(`${this.getApiUrl()}/v2/accounts/${address}`)
        .then(response => response.json())
        .then((data) => {
          observer.next(data.balance);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * Signs a message using the user's wallet.
   * @param message The message to sign.
   * @returns A Promise that resolves to the signature data containing signature and publicKey.
   */
  public async signMessage(message: string): Promise<{ signature: string, publicKey: string }> {
    if (!this.isLoggedIn()) {
      throw new Error('User is not logged in');
    }

    return new Promise((resolve, reject) => {
      openSignatureRequestPopup({
        message,
        appDetails: {
          name: myAppName,
          icon: myAppIcon,
        },
        onFinish: (data) => {
          console.log('Signature data:', data);
          resolve({
            signature: data.signature,
            publicKey: data.publicKey
          });
        },
        onCancel: () => {
          reject(new Error('User cancelled message signing'));
        }
      });
    });
  }

}
