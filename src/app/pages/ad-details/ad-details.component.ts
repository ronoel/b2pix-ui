import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Advertisement, AdvertisementStatus } from '../../shared/models/advertisement.model';
import { Buy, BuyStatus } from '../../shared/models/buy.model';
import { AdvertisementService } from '../../shared/api/advertisement.service';
import { BuyService } from '../../shared/api/buy.service';
import { LoadingService } from '../../services/loading.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ad-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ad-details">
      <div class="container">
        <!-- Header -->
        <div class="page-header">
          <div class="header-left">
            <button class="back-button" (click)="goBack()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="header-content">
              <h1 class="page-title">Detalhes do Anúncio</h1>
              <p class="page-subtitle">Visualize as informações do anúncio e suas vendas</p>
            </div>
          </div>
          <div class="header-right">
            <button class="refresh-button" (click)="refreshData()" [disabled]="isLoading()" title="Atualizar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" [class.spinning]="isLoading()">
                <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.49 15C19.9828 16.8412 18.8943 18.4814 17.4001 19.6586C15.9059 20.8357 14.0932 21.4836 12.2188 21.4954C10.3445 21.5072 8.52416 20.8823 7.01362 19.7264C5.50309 18.5705 4.39074 16.9453 3.85848 15.1127C3.32621 13.2801 3.40362 11.3236 4.07803 9.54493C4.75244 7.76625 6.00477 6.2602 7.64736 5.26274C9.28995 4.26528 11.2197 3.83311 13.1294 4.03988C15.0392 4.24665 16.8295 5.08062 18.21 6.39L23 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="isLoading()">
          <div class="loading-spinner">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
          </div>
          <p class="loading-text">Carregando dados...</p>
        </div>

        <!-- Error State -->
        <div class="error-state" *ngIf="error() && !isLoading()">
          <div class="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="error-title">Erro ao carregar dados</h3>
          <p class="error-description">{{ error() }}</p>
          <button class="retry-button" (click)="retryLoadData()">
            Tentar Novamente
          </button>
        </div>

        <!-- Advertisement Details -->
        <div class="ad-section" *ngIf="!isLoading() && !error() && advertisement()">
          <div class="ad-card">
            <div class="ad-header">
              <div class="ad-status-badge" [ngClass]="getStatusClass(advertisement()!.status)">
                {{ getStatusLabel(advertisement()!.status) }}
              </div>
            </div>

            <div class="ad-content">
              <div class="ad-main-info">
                <div class="ad-price">
                  <span class="price-label">Preço por Bitcoin:</span>
                  <span class="price-value">{{ formatPriceCurrency(advertisement()!.price) }}</span>
                </div>
                <div class="ad-amount">
                  <span class="amount-label">Quantidade:</span>
                  <span class="amount-value">{{ formatBTC(advertisement()!.total_amount) }} BTC</span>
                </div>
              </div>

              <div class="ad-details">
                <div class="detail-item">
                  <span class="detail-label">Restante:</span>
                  <span class="detail-value">{{ formatBTC(advertisement()!.available_amount) }} BTC</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Valor Mínimo:</span>
                  <span class="detail-value">{{ formatCentsToReais(advertisement()!.min_amount) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Valor Máximo:</span>
                  <span class="detail-value">{{ formatCentsToReais(advertisement()!.max_amount) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Criado:</span>
                  <span class="detail-value">{{ formatDate(advertisement()!.created_at) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Blockchain:</span>
                  <span class="detail-value">
                    <button 
                      *ngIf="advertisement()!.transaction_id"
                      class="blockchain-link" 
                      (click)="openBlockchainExplorer(advertisement()!.transaction_id!)"
                      title="Ver transação na blockchain"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M18 13V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V8C3 6.89543 3.89543 6 5 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M15 3H21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Ver na Blockchain
                    </button>
                    <span *ngIf="!advertisement()!.transaction_id" class="no-transaction">
                      Aguardando transação
                    </span>
                  </span>
                </div>
              </div>

              <div class="ad-progress" *ngIf="advertisement()!.status === 'ready'">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="getProgressPercentage(advertisement()!)"></div>
                </div>
                <div class="progress-text">
                  {{ getProgressPercentage(advertisement()!) }}% vendido
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Buys Section -->
        <div class="buys-section" *ngIf="!isLoading() && !error() && advertisement()">
          <div class="section-header">
            <h2 class="section-title">Vendas Realizadas</h2>
            <div class="buys-count">
              {{ buys().length }} vendas
            </div>
          </div>

          <!-- Buys List -->
          <div class="buys-list" *ngIf="buys().length > 0">
            <div class="buy-card" *ngFor="let buy of buys()">
              <div class="buy-header">
                <div class="buy-id">
                  ID: {{ buy.id.substring(0, 8) }}...
                </div>
                <div class="buy-status-badge" [ngClass]="getBuyStatusClass(buy.status)">
                  {{ getBuyStatusLabel(buy.status) }}
                </div>
              </div>

              <div class="buy-content">
                <div class="buy-amounts">
                  <div class="amount-item">
                    <span class="amount-label">Sats:</span>
                    <span class="amount-value">{{ formatSats(buy.amount) }}</span>
                  </div>
                  <div class="amount-item">
                    <span class="amount-label">Valor BRL:</span>
                    <span class="amount-value">{{ formatCentsToReais(buy.pay_value) }}</span>
                  </div>
                </div>

                <div class="buy-details">
                  <div class="detail-item">
                    <span class="detail-label">Preço:</span>
                    <span class="detail-value">{{ formatCentsToReais(buy.price) }}/BTC</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Comprador:</span>
                    <span class="detail-value">{{ buy.address_buy.substring(0, 8) }}...</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">PIX:</span>
                    <span class="detail-value">{{ buy.pix_key.substring(0, 8) }}...</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Criado:</span>
                    <span class="detail-value">{{ formatDate(buy.created_at) }}</span>
                  </div>
                  <div class="detail-item" *ngIf="buy.expires_at">
                    <span class="detail-label">Expira:</span>
                    <span class="detail-value">{{ formatDate(buy.expires_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty Buys State -->
          <div class="empty-buys-state" *ngIf="buys().length === 0">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M8 14S9.5 16 12 16S16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 9H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 9H15.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="empty-title">Nenhuma venda realizada</h3>
            <p class="empty-description">
              Este anúncio ainda não possui vendas realizadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ad-details {
      min-height: 100vh;
      background: var(--background-dark);
      padding: var(--spacing-xl) 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-lg);
    }

    /* Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-2xl);
      padding-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
    }

    .back-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .back-button:hover {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    .page-title {
      font-size: var(--font-size-3xl);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .page-subtitle {
      color: var(--text-secondary);
      margin: 0;
    }

    .header-right {
      display: flex;
      gap: var(--spacing-md);
      align-items: center;
    }

    .refresh-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .refresh-button:hover:not(:disabled) {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    .refresh-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-4xl) var(--spacing-xl);
      text-align: center;
    }

    .loading-spinner {
      margin-bottom: var(--spacing-lg);
      color: var(--primary-color);
    }

    .loading-text {
      color: var(--text-secondary);
      margin: 0;
    }

    /* Error State */
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-4xl) var(--spacing-xl);
      text-align: center;
    }

    .error-icon {
      margin-bottom: var(--spacing-lg);
      color: var(--error-color);
    }

    .error-title {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
    }

    .error-description {
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-lg) 0;
    }

    .retry-button {
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      padding: var(--spacing-sm) var(--spacing-lg);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .retry-button:hover {
      background: var(--primary-hover);
    }

    /* Advertisement Section */
    .ad-section {
      margin-bottom: var(--spacing-2xl);
    }

    .ad-card {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .ad-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
    }

    .ad-status-badge {
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius);
      font-size: var(--font-size-sm);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ad-status-badge.ready {
      background: #22c55e20;
      color: #22c55e;
    }

    .ad-status-badge.pending {
      background: #f59e0b20;
      color: #f59e0b;
    }

    .ad-status-badge.disabled {
      background: #64748b20;
      color: #64748b;
    }

    .ad-content {
      padding: var(--spacing-lg);
    }

    .ad-main-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
    }

    .ad-price, .ad-amount {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .price-label, .amount-label {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .price-value {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--success-color);
    }

    .amount-value {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--primary-color);
    }

    .ad-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .detail-label {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .detail-value {
      color: var(--text-primary);
      font-weight: 500;
    }

    .blockchain-link {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .blockchain-link:hover {
      background: var(--primary-hover);
    }

    .no-transaction {
      color: var(--text-muted);
      font-style: italic;
    }

    .ad-progress {
      margin-top: var(--spacing-lg);
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: var(--border-color);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: var(--spacing-xs);
    }

    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      transition: width 0.3s ease;
    }

    .progress-text {
      text-align: center;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    /* Buys Section */
    .buys-section {
      margin-bottom: var(--spacing-2xl);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
    }

    .section-title {
      font-size: var(--font-size-2xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .buys-count {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--border-color);
      border-radius: var(--border-radius);
    }

    .buys-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .buy-card {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .buy-card:hover {
      border-color: var(--primary-color);
    }

    .buy-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--background-color);
      border-bottom: 1px solid var(--border-color);
    }

    .buy-id {
      font-family: monospace;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .buy-status-badge {
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius);
      font-size: var(--font-size-xs);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .buy-status-badge.pending {
      background: #f59e0b20;
      color: #f59e0b;
    }

    .buy-status-badge.paid {
      background: #3b82f620;
      color: #3b82f6;
    }

    .buy-status-badge.completed {
      background: #22c55e20;
      color: #22c55e;
    }

    .buy-status-badge.cancelled,
    .buy-status-badge.expired {
      background: #ef444420;
      color: #ef4444;
    }

    .buy-content {
      padding: var(--spacing-lg);
    }

    .buy-amounts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
    }

    .amount-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .buy-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-md);
    }

    /* Empty States */
    .empty-buys-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-4xl) var(--spacing-xl);
      text-align: center;
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
    }

    .empty-icon {
      margin-bottom: var(--spacing-lg);
      color: var(--text-muted);
    }

    .empty-title {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
    }

    .empty-description {
      color: var(--text-secondary);
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .ad-main-info,
      .buy-amounts {
        grid-template-columns: 1fr;
      }

      .ad-details,
      .buy-details {
        grid-template-columns: 1fr;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
      }

      .header-left {
        width: 100%;
      }

      .header-right {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class AdDetailsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private advertisementService = inject(AdvertisementService);
  private buyService = inject(BuyService);
  private loadingService = inject(LoadingService);

  public isLoading = signal(false);
  public error = signal<string | null>(null);
  public advertisement = signal<Advertisement | null>(null);
  public buys = signal<Buy[]>([]);

  ngOnInit() {
    const advertisementId = this.route.snapshot.paramMap.get('advertisement_id');
    if (advertisementId) {
      this.loadData(advertisementId);
    } else {
      this.error.set('ID do anúncio não encontrado');
    }
  }

  goBack() {
    this.router.navigate(['/my-ads']);
  }

  refreshData() {
    const advertisementId = this.route.snapshot.paramMap.get('advertisement_id');
    if (advertisementId) {
      this.loadData(advertisementId);
    }
  }

  retryLoadData() {
    const advertisementId = this.route.snapshot.paramMap.get('advertisement_id');
    if (advertisementId) {
      this.loadData(advertisementId);
    }
  }

  private loadData(advertisementId: string) {
    this.isLoading.set(true);
    this.error.set(null);

    // Load advertisement details
    this.advertisementService.getAdvertisementById(advertisementId).subscribe({
      next: (ad: Advertisement) => {
        this.advertisement.set(ad);
        
        // Load buys for this advertisement
        this.buyService.getBuysByAdvertisementId(advertisementId).subscribe({
          next: (buys: Buy[]) => {
            this.buys.set(buys);
            this.isLoading.set(false);
          },
          error: (error: any) => {
            console.error('Error loading buys:', error);
            this.buys.set([]);
            this.isLoading.set(false);
          }
        });
      },
      error: (error: any) => {
        console.error('Error loading advertisement:', error);
        this.error.set('Erro ao carregar anúncio');
        this.isLoading.set(false);
      }
    });
  }

  getStatusClass(status: AdvertisementStatus): string {
    switch (status) {
      case AdvertisementStatus.READY:
        return 'ready';
      case AdvertisementStatus.PENDING:
        return 'pending';
      case AdvertisementStatus.DISABLED:
      case AdvertisementStatus.CLOSED:
        return 'disabled';
      default:
        return 'pending';
    }
  }

  getStatusLabel(status: AdvertisementStatus): string {
    switch (status) {
      case AdvertisementStatus.DRAFT:
        return 'Rascunho';
      case AdvertisementStatus.PENDING:
        return 'Aguardando';
      case AdvertisementStatus.READY:
        return 'Ativo';
      case AdvertisementStatus.BANK_FAILED:
        return 'Erro Bancário';
      case AdvertisementStatus.DEPOSIT_FAILED:
        return 'Erro Depósito';
      case AdvertisementStatus.CLOSED:
        return 'Fechado';
      case AdvertisementStatus.DISABLED:
        return 'Pausado';
      default:
        return status;
    }
  }

  getBuyStatusClass(status: BuyStatus): string {
    switch (status) {
      case BuyStatus.Pending:
        return 'pending';
      case BuyStatus.Paid:
        return 'paid';
      case BuyStatus.Completed:
        return 'completed';
      case BuyStatus.Cancelled:
      case BuyStatus.Expired:
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  getBuyStatusLabel(status: BuyStatus): string {
    switch (status) {
      case BuyStatus.Pending:
        return 'Aguardando Pagamento';
      case BuyStatus.Paid:
        return 'Pago';
      case BuyStatus.Completed:
        return 'Concluído';
      case BuyStatus.Cancelled:
        return 'Cancelado';
      case BuyStatus.Expired:
        return 'Expirado';
      case BuyStatus.InDispute:
        return 'Em Disputa';
      case BuyStatus.DisputeResolvedBuyer:
        return 'Disputa - Comprador';
      case BuyStatus.DisputeResolvedSeller:
        return 'Disputa - Vendedor';
      default:
        return status;
    }
  }

  formatPriceCurrency(price: bigint): string {
    const priceInReais = Number(price) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceInReais);
  }

  formatBTC(amount: bigint): string {
    const btcAmount = Number(amount) / 100000000; // Convert satoshis to BTC
    return btcAmount.toFixed(8);
  }

  formatSats(amount: string): string {
    return new Intl.NumberFormat('pt-BR').format(Number(amount));
  }

  formatCentsToReais(cents: string | number): string {
    const reais = Number(cents) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(reais);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getProgressPercentage(ad: Advertisement): number {
    if (Number(ad.total_amount) === 0) return 0;
    const sold = Number(ad.total_amount) - Number(ad.available_amount);
    return Math.round((sold / Number(ad.total_amount)) * 100);
  }

  // Generate blockchain explorer link
  getBlockchainExplorerLink(transactionId: string): string {
    // Add 0x prefix if not present and generate Hiro explorer link
    const txId = transactionId.startsWith('0x') ? transactionId : `0x${transactionId}`;
    const chain = environment.network === 'mainnet' ? 'mainnet' : 'testnet';
    return `https://explorer.hiro.so/txid/${txId}?chain=${chain}`;
  }

  openBlockchainExplorer(transactionId: string) {
    const url = this.getBlockchainExplorerLink(transactionId);
    window.open(url, '_blank');
  }
}