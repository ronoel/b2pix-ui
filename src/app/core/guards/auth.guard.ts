import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { WalletService } from "../../libs/wallet.service";
import { B2pixService } from "../../libs/b2pix.service";
import { map, catchError, of } from "rxjs";

export const authGuard: CanActivateFn = (route, state) => {
  const walletService = inject(WalletService);
  const b2pixService = inject(B2pixService);
  const router = inject(Router);

  // Check if wallet is connected
  if (!walletService.isLoggedInSignal()) {
    router.navigate(['/']);
    return false;
  }

  const address = walletService.walletAddressSignal();
  if (!address) {
    router.navigate(['/']);
    return false;
  }

  // Check invite status
  return b2pixService.getInviteByAddress(address).pipe(
    map((invite) => {
      if (invite.status === 'blocked') {
        router.navigate(['/blocked']);
        return false;
      }
      
      if (invite.status === 'claimed') {
        return true;
      }

      // Any other status (pending, etc.)
      router.navigate(['/invite-validation']);
      return false;
    }),
    catchError(() => {
      // No invite found
      router.navigate(['/invite-validation']);
      return of(false);
    })
  );
};
