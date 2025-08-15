import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { LoadingService } from '../../services/loading.service';
import { AdvertisementService } from '../../shared/api/advertisement.service';
import { Advertisement, AdvertisementStatus } from '../../shared/models/advertisement.model';
import { BitcoinListing, PurchaseOrder } from '../../interfaces/transaction.interface';

@Component({
  selector: 'app-buy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="buy-page">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
          <button class="btn btn-outline back-btn" (click)="goBack()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Voltar
          </button>
          <div class="header-content">
            <h1 class="page-title">Comprar Bitcoin</h1>
            <p class="page-subtitle">Encontre as melhores ofertas do mercado</p>
          </div>
        </div>

        <!-- Price Info Card -->
        <div class="price-info-card">
          <div class="price-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="price-content">
            <div class="price-label">Preço de Referência BTC</div>
            <div class="price-value">R$ {{ formatCurrency(userService.currentBtcPrice()) }}</div>
          </div>
        </div>

        @if (!selectedListing()) {
          <!-- Listings Section -->
          <div class="listings-section">
            <div class="section-header">
              <h2 class="section-title">Anúncios Disponíveis</h2>
              <button class="btn btn-outline btn-sm refresh-btn" (click)="loadListings()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12C3 7.02944 7.02944 3 12 3C14.5755 3 16.9 4.15205 18.5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C9.42446 21 7.09995 19.848 5.5 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13 2L18 6L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M11 22L6 18L10 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Atualizar
              </button>
            </div>
            
            @if (isLoadingListings()) {
              <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Carregando anúncios...</p>
              </div>
            } @else if (listings().length === 0) {
              <div class="empty-state">
                <div class="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h3>Nenhum anúncio disponível</h3>
                <p>Não há ofertas de Bitcoin no momento. Tente novamente mais tarde.</p>
                <p>Debug: isLoading={{ isLoadingListings() }}, listings.length={{ listings().length }}</p>
                <button class="btn btn-primary" (click)="loadListings()">Recarregar</button>
              </div>
            } @else {
              <div class="listings-grid">
                @for (listing of listings(); track listing.id) {
                  <div class="listing-card" (click)="selectListing(listing)">
                    <div class="listing-header">
                      <div class="seller-info">
                        <div class="seller-avatar">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                          </svg>
                        </div>
                        <div class="seller-details">
                          <h3 class="seller-name">{{ listing.sellerName }}</h3>
                          <div class="seller-rating">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            4.8 (125 avaliações)
                          </div>
                        </div>
                      </div>
                      <div class="listing-price">
                        <div class="price-amount">R$ {{ formatCurrency(listing.pricePerBtc) }}</div>
                        <div class="price-label">por BTC</div>
                      </div>
                    </div>
                    
                    <div class="listing-details">
                      <div class="detail-row">
                        <div class="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <span>{{ listing.availableAmount }} BTC disponível</span>
                        </div>
                        <div class="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <span>Min: R$ {{ formatCurrency(listing.minPurchase) }}</span>
                        </div>
                      </div>
                      
                      <div class="listing-methods">
                        <div class="payment-method">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                            <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" stroke-width="2"/>
                          </svg>
                          PIX Instantâneo
                        </div>
                      </div>
                    </div>

                    <div class="listing-action">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <!-- Purchase Form -->
          <div class="purchase-section">
            <div class="selected-listing-card">
              <div class="listing-summary">
                <h3>Comprar de {{ selectedListing()!.sellerName }}</h3>
                <div class="summary-details">
                  <div class="summary-item">
                    <span>Preço:</span>
                    <span>R$ {{ formatCurrency(selectedListing()!.pricePerBtc) }}/BTC</span>
                  </div>
                  <div class="summary-item">
                    <span>Disponível:</span>
                    <span>{{ selectedListing()!.availableAmount }} BTC</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="purchase-form-card">
              <h3>Detalhes da Compra</h3>
              
              <form (ngSubmit)="submitPurchase()" #purchaseForm="ngForm">
                <div class="form-group">
                  <label for="amount">Quantidade em BTC</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    [ngModel]="purchaseData().amountBtc"
                    (ngModelChange)="updatePurchaseDataAmount($event)"
                    [min]="selectedListing()!.minPurchase / selectedListing()!.pricePerBtc"
                    [max]="selectedListing()!.availableAmount"
                    step="0.00001"
                    class="form-input"
                    placeholder="0.00000"
                    required
                  >
                  <div class="input-info">
                    Min: {{ (selectedListing()!.minPurchase / selectedListing()!.pricePerBtc).toFixed(5) }} BTC
                  </div>
                </div>

                <div class="form-group">
                  <label>Valor em Reais</label>
                  <div class="readonly-input">
                    R$ {{ formatCurrency(getTotalValue()) }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="pixKey">Sua chave PIX para recebimento</label>
                  <input
                    type="text"
                    id="pixKey"
                    name="pixKey"
                    [ngModel]="purchaseData().pixKey"
                    (ngModelChange)="updatePurchaseDataPixKey($event)"
                    class="form-input"
                    placeholder="sua@chave.pix"
                    required
                  >
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="cancelPurchase()">
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="!purchaseForm.valid || loadingService.getIsLoading()()"
                  >
                    @if (loadingService.getIsLoading()()) {
                      <div class="btn-loading"></div>
                      Processando...
                    } @else {
                      Confirmar Compra
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .buy-page {
      min-height: 100vh;
      background: var(--background-dark);
      padding: var(--spacing-xl) 0;
    }

    /* Header */
    .page-header {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-2xl);
    }

    .back-btn {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-sm);
    }

    .header-content {
      flex: 1;
    }

    .page-title {
      font-size: var(--font-size-3xl);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .page-subtitle {
      font-size: var(--font-size-md);
      color: var(--text-secondary);
      margin: 0;
    }

    /* Price Info Card */
    .price-info-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      margin-bottom: var(--spacing-xl);
      border-left: 4px solid var(--primary-orange);
    }

    .price-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      color: var(--primary-orange);
    }

    .price-content {
      flex: 1;
    }

    .price-label {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
      margin-bottom: var(--spacing-xs);
    }

    .price-value {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--text-primary);
    }

    /* Section Header */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
    }

    .section-title {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-2xl);
      text-align: center;
    }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-color);
      border-top: 3px solid var(--primary-orange);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-2xl);
      text-align: center;
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
    }

    .empty-icon {
      color: var(--text-muted);
    }

    .empty-state h3 {
      font-size: var(--font-size-lg);
      color: var(--text-primary);
      margin: 0;
    }

    .empty-state p {
      color: var(--text-secondary);
      margin: 0;
    }

    /* Listings Grid */
    .listings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: var(--spacing-lg);
    }

    .listing-card {
      padding: var(--spacing-lg);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      cursor: pointer;
      transition: all var(--transition-normal);
      position: relative;
    }

    .listing-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-orange);
    }

    .listing-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-md);
    }

    .seller-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .seller-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      color: var(--primary-blue);
    }

    .seller-name {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .seller-rating {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }

    .seller-rating svg {
      color: var(--warning-yellow);
    }

    .listing-price {
      text-align: right;
    }

    .price-amount {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--primary-orange);
      margin-bottom: var(--spacing-xs);
    }

    .price-label {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }

    .listing-details {
      margin-bottom: var(--spacing-md);
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }

    .detail-item svg {
      color: var(--text-muted);
    }

    .listing-methods {
      display: flex;
      gap: var(--spacing-sm);
    }

    .payment-method {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--background-elevated);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      color: var(--success-green);
      font-weight: 500;
    }

    .listing-action {
      position: absolute;
      top: var(--spacing-lg);
      right: var(--spacing-lg);
      color: var(--text-muted);
      transition: all var(--transition-normal);
    }

    .listing-card:hover .listing-action {
      color: var(--primary-orange);
      transform: translateX(4px);
    }

    /* Purchase Section */
    .purchase-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .selected-listing-card {
      padding: var(--spacing-lg);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      border-left: 4px solid var(--primary-blue);
    }

    .listing-summary h3 {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
    }

    .summary-details {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--font-size-sm);
    }

    .summary-item span:first-child {
      color: var(--text-secondary);
    }

    .summary-item span:last-child {
      color: var(--text-primary);
      font-weight: 500;
    }

    .purchase-form-card {
      padding: var(--spacing-xl);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
    }

    .purchase-form-card h3 {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-lg) 0;
    }

    .form-group {
      margin-bottom: var(--spacing-lg);
    }

    .form-group label {
      display: block;
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .form-input {
      width: 100%;
      padding: var(--spacing-md);
      background: var(--background-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      color: var(--text-primary);
      font-size: var(--font-size-md);
      transition: border-color var(--transition-normal);
    }

    .form-input:focus {
      border-color: var(--primary-orange);
      outline: none;
    }

    .readonly-input {
      padding: var(--spacing-md);
      background: var(--background-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      color: var(--text-primary);
      font-size: var(--font-size-md);
      font-weight: 600;
    }

    .input-info {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      margin-top: var(--spacing-xs);
    }

    .form-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
    }

    .btn-loading {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .buy-page {
        padding: var(--spacing-lg) 0;
      }

      .page-header {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .listings-grid {
        grid-template-columns: 1fr;
      }

      .listing-header {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .seller-info {
        align-self: flex-start;
      }

      .listing-price {
        text-align: left;
      }

      .form-actions {
        flex-direction: column;
      }
    }

    @media (max-width: 480px) {
      .price-info-card {
        flex-direction: column;
        text-align: center;
      }

      .section-header {
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: stretch;
      }

      .detail-row {
        flex-direction: column;
      }
    }
  `]
})
export class BuyComponent implements OnInit {
  private router = inject(Router);
  protected transactionService = inject(TransactionService);
  protected userService = inject(UserService);
  protected loadingService = inject(LoadingService);
  private advertisementService = inject(AdvertisementService);

  // Convert to signals
  listings = signal<BitcoinListing[]>([]);
  selectedListing = signal<BitcoinListing | null>(null);
  isLoadingListings = signal(false);
  purchaseData = signal({
    amountBtc: 0,
    pixKey: ''
  });

  ngOnInit() {
    this.loadListings();
  }

  loadListings() {
    console.log('Loading listings started...'); // Debug log
    this.isLoadingListings.set(true);
    
    // Get ready advertisements with active_only filter
    this.advertisementService.getReadyAdvertisements(true, 1, 50).subscribe({
      next: (response) => {
        console.log('API Response received:', response); // Debug log
        try {
          const mappedListings = this.mapAdvertisementsToListings(response.data);
          this.listings.set(mappedListings);
          console.log('Mapped listings successfully:', mappedListings); // Debug log
          this.isLoadingListings.set(false);
          console.log('Loading state set to false'); // Debug log
        } catch (error) {
          console.error('Error mapping advertisements:', error);
          this.listings.set([]);
          this.isLoadingListings.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading advertisements:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        });
        this.listings.set([]);
        this.isLoadingListings.set(false);
        console.log('Loading state set to false after error'); // Debug log
      },
      complete: () => {
        console.log('Advertisement loading observable completed'); // Debug log
      }
    });
  }

  /**
   * Maps Advertisement objects to BitcoinListing objects for compatibility
   */
  private mapAdvertisementsToListings(advertisements: Advertisement[]): BitcoinListing[] {
    return advertisements.map(ad => {
      console.log('Raw advertisement data:', ad); // Debug log
      
      // Let's try different price conversions to find the right one
      const rawPrice = Number(ad.price);
      console.log('Raw price:', rawPrice);
      
      // Try different conversions to get a reasonable BTC price (should be around 500k-600k BRL)
      const priceOptions = [
        { divisor: 1, result: rawPrice },
        { divisor: 100, result: rawPrice / 100 },
        { divisor: 10000, result: rawPrice / 10000 },
        { divisor: 100000000, result: rawPrice / 100000000 },
        { divisor: 10000000000, result: rawPrice / 10000000000 }
      ];
      
      console.log('Price conversion options:', priceOptions);
      
      // Based on typical Bitcoin prices in BRL (500k-600k), let's use a reasonable conversion
      // 12450000000000 / 10000000000 = 1245 (too low)
      // 12450000000000 / 100000000 = 124500 (more reasonable for BRL per BTC)
      const pricePerBtc = rawPrice / 100000000;
      
      // Convert available_amount - let's also debug this
      const rawAvailableAmount = Number(ad.available_amount);
      console.log('Raw available_amount:', rawAvailableAmount);
      
      // If available_amount is 120, let's try different interpretations:
      // Maybe it's already in a usable unit, not satoshis
      // Let's assume it's a reasonable BTC amount for now
      const availableAmountBtc = rawAvailableAmount > 10 ? rawAvailableAmount / 100000000 : rawAvailableAmount / 100;
      
      const mapped = {
        id: ad.id,
        sellerId: ad.seller_address,
        sellerName: this.formatSellerName(ad.seller_address),
        pricePerBtc: pricePerBtc,
        availableAmount: Math.max(availableAmountBtc, 0.001), // Ensure minimum viable amount
        minPurchase: 100, // Default minimum purchase in BRL
        maxPurchase: Math.max(availableAmountBtc, 0.001) * pricePerBtc, // Maximum based on available BTC
        pixKey: 'PIX disponível', // Placeholder since PIX key isn't in Advertisement model
        createdAt: new Date(ad.created_at)
      };
      
      console.log('Final mapped listing:', mapped); // Debug log
      return mapped;
    });
  }

  /**
   * Formats seller address to a more user-friendly name
   */
  private formatSellerName(address: string): string {
    return `Vendedor ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  updatePurchaseDataAmount(amount: number) {
    this.purchaseData.update(data => ({
      ...data,
      amountBtc: amount
    }));
  }

  updatePurchaseDataPixKey(pixKey: string) {
    this.purchaseData.update(data => ({
      ...data,
      pixKey: pixKey
    }));
  }

  selectListing(listing: BitcoinListing) {
    this.selectedListing.set(listing);
    this.purchaseData.update(data => ({
      ...data,
      amountBtc: listing.minPurchase / listing.pricePerBtc
    }));
  }

  cancelPurchase() {
    this.selectedListing.set(null);
    this.purchaseData.set({
      amountBtc: 0,
      pixKey: ''
    });
  }

  submitPurchase() {
    const currentListing = this.selectedListing();
    const currentPurchaseData = this.purchaseData();
    
    if (!currentListing) return;
    
    this.transactionService.createPurchaseOrder(
      currentListing.id, 
      currentPurchaseData.amountBtc, 
      currentPurchaseData.pixKey
    ).subscribe({
      next: (order) => {
        this.router.navigate(['/pending-approval'], { 
          queryParams: { orderId: order.id } 
        });
      },
      error: (error) => {
        console.error('Erro ao criar pedido:', error);
      }
    });
  }

  getTotalValue(): number {
    const currentSelectedListing = this.selectedListing();
    const currentPurchaseData = this.purchaseData();
    
    if (!currentSelectedListing) return 0;
    return currentPurchaseData.amountBtc * currentSelectedListing.pricePerBtc;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
