import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Advertisement, AdvertisementStatus } from '../../shared/models/advertisement.model';

@Component({
  selector: 'app-my-ads',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="my-ads">
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
              <h1 class="page-title">Meus Anúncios</h1>
              <p class="page-subtitle">Gerencie seus anúncios de venda de Bitcoin</p>
            </div>
          </div>
          <div class="header-right">
            <button class="create-ad-button" (click)="createNewAd()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Criar Anúncio
            </button>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon active">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ getActiveAdsCount() }}</div>
                <div class="stat-label">Anúncios Ativos</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon total">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M17 3V5H7V3" stroke="currentColor" stroke-width="2"/>
                  <path d="M19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5H19Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ myAds().length }}</div>
                <div class="stat-label">Total de Anúncios</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon earnings">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2V22" stroke="currentColor" stroke-width="2"/>
                  <path d="M17 5H9.5C8.11929 5 7 6.11929 7 7.5V7.5C7 8.88071 8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5V12.5C17 13.8807 15.8807 15 14.5 15H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ formatCurrency(getTotalEarnings()) }}</div>
                <div class="stat-label">Total Negociado</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ads List -->
        <div class="ads-section">
          <div class="section-header">
            <h2 class="section-title">Seus Anúncios</h2>
            <div class="filter-buttons">
              <button 
                class="filter-button" 
                [class.active]="selectedFilter() === 'all'"
                (click)="setFilter('all')"
              >
                Todos
              </button>
              <button 
                class="filter-button" 
                [class.active]="selectedFilter() === 'active'"
                (click)="setFilter('active')"
              >
                Ativos
              </button>
              <button 
                class="filter-button" 
                [class.active]="selectedFilter() === 'inactive'"
                (click)="setFilter('inactive')"
              >
                Inativos
              </button>
            </div>
          </div>

          <div class="ads-list" *ngIf="filteredAds().length > 0; else emptyState">
            <div class="ad-card" *ngFor="let ad of filteredAds()">
              <div class="ad-header">
                <div class="ad-status-badge" [ngClass]="getStatusClass(ad.status)">
                  {{ getStatusLabel(ad.status) }}
                </div>
                <div class="ad-actions">
                  <button class="action-button" (click)="editAd(ad)" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H16C17.1046 20 18 19.1046 18 18V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button class="action-button" (click)="toggleAdStatus(ad)" [title]="ad.is_active ? 'Pausar' : 'Ativar'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" *ngIf="ad.is_active">
                      <rect x="6" y="4" width="4" height="16" stroke="currentColor" stroke-width="2"/>
                      <rect x="14" y="4" width="4" height="16" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" *ngIf="!ad.is_active">
                      <polygon points="5,3 19,12 5,21" stroke="currentColor" stroke-width="2" fill="currentColor"/>
                    </svg>
                  </button>
                  <button class="action-button delete" (click)="deleteAd(ad)" title="Excluir">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="ad-content">
                <div class="ad-main-info">
                  <div class="ad-price">
                    <span class="price-label">Preço por Bitcoin:</span>
                    <span class="price-value">{{ formatPriceCurrency(ad.price) }}</span>
                  </div>
                  <div class="ad-amount">
                    <span class="amount-label">Quantidade:</span>
                    <span class="amount-value">{{ formatBTC(ad.amount_fund) }} BTC</span>
                  </div>
                </div>

                <div class="ad-details">
                  <div class="detail-item">
                    <span class="detail-label">Restante:</span>
                    <span class="detail-value">{{ formatBTC(ad.remaining_fund) }} BTC</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Criado:</span>
                    <span class="detail-value">{{ formatDate(ad.created_at) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">ID:</span>
                    <span class="detail-value">{{ ad.id.substring(0, 8) }}...</span>
                  </div>
                </div>

                <div class="ad-progress" *ngIf="ad.status === 'ready'">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="getProgressPercentage(ad)"></div>
                  </div>
                  <div class="progress-text">
                    {{ getProgressPercentage(ad) }}% vendido
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #emptyState>
            <div class="empty-state">
              <div class="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 15H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M17 3V5H7V3" stroke="currentColor" stroke-width="2"/>
                  <path d="M19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5H19Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <h3 class="empty-title">Nenhum anúncio encontrado</h3>
              <p class="empty-description">
                {{ selectedFilter() === 'all' 
                  ? 'Você ainda não criou nenhum anúncio. Comece criando seu primeiro anúncio de venda!' 
                  : 'Não há anúncios nesta categoria.' 
                }}
              </p>
              <button class="empty-action-button" (click)="createNewAd()" *ngIf="selectedFilter() === 'all'">
                Criar Primeiro Anúncio
              </button>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-ads {
      min-height: 100vh;
      background: var(--background-dark);
      padding: var(--spacing-xl) 0;
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

    .create-ad-button {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .create-ad-button:hover {
      background: var(--primary-hover);
      transform: translateY(-2px);
    }

    /* Stats Section */
    .stats-section {
      margin-bottom: var(--spacing-2xl);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-lg);
    }

    .stat-card {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--border-radius);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.active {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .stat-icon.total {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .stat-icon.earnings {
      background: rgba(168, 85, 247, 0.1);
      color: #a855f7;
    }

    .stat-value {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    /* Ads Section */
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

    .filter-buttons {
      display: flex;
      gap: var(--spacing-sm);
    }

    .filter-button {
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--surface-color);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: var(--font-size-sm);
    }

    .filter-button.active,
    .filter-button:hover {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    /* Ad Cards */
    .ads-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .ad-card {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .ad-card:hover {
      border-color: var(--primary-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .ad-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-lg);
      background: rgba(0, 0, 0, 0.02);
      border-bottom: 1px solid var(--border-color);
    }

    .ad-status-badge {
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--border-radius);
      font-size: var(--font-size-xs);
      font-weight: 600;
      text-transform: uppercase;
    }

    .ad-status-badge.ready {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .ad-status-badge.pending {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
    }

    .ad-status-badge.draft {
      background: rgba(156, 163, 175, 0.1);
      color: #9ca3af;
    }

    .ad-status-badge.disabled {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .ad-actions {
      display: flex;
      gap: var(--spacing-sm);
    }

    .action-button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-button:hover {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
    }

    .action-button.delete:hover {
      background: #ef4444;
      border-color: #ef4444;
    }

    .ad-content {
      padding: var(--spacing-lg);
    }

    .ad-main-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);
    }

    .ad-price,
    .ad-amount {
      display: flex;
      flex-direction: column;
    }

    .price-label,
    .amount-label {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .price-value {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--primary-color);
    }

    .amount-value {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--text-primary);
    }

    .ad-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      background: rgba(0, 0, 0, 0.02);
      border-radius: var(--border-radius);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
    }

    .detail-label {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .detail-value {
      font-weight: 600;
      color: var(--text-primary);
    }

    .ad-progress {
      margin-top: var(--spacing-md);
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(0, 0, 0, 0.1);
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
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      text-align: center;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: var(--spacing-3xl) var(--spacing-lg);
    }

    .empty-icon {
      margin: 0 auto var(--spacing-lg);
      color: var(--text-tertiary);
    }

    .empty-title {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .empty-description {
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-lg) 0;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .empty-action-button {
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .empty-action-button:hover {
      background: var(--primary-hover);
      transform: translateY(-2px);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-lg);
      }

      .header-left {
        width: 100%;
      }

      .header-right {
        width: 100%;
      }

      .create-ad-button {
        width: 100%;
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
      }

      .filter-buttons {
        width: 100%;
        justify-content: space-between;
      }

      .filter-button {
        flex: 1;
        text-align: center;
      }

      .ad-main-info {
        grid-template-columns: 1fr;
      }

      .ad-details {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MyAdsComponent implements OnInit {
  private router = inject(Router);

  // Signals for reactive state management
  myAds = signal<Advertisement[]>([]);
  selectedFilter = signal<'all' | 'active' | 'inactive'>('all');

  ngOnInit() {
    this.loadMockData();
  }

  // Load mock data for development
  loadMockData() {
    const mockAds: Advertisement[] = [
      {
        id: 'ad-001',
        seller_address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        token: 'BTC',
        currency: 'BRL',
        price: BigInt(32000000), // R$ 320.000,00 por BTC (em centavos)
        amount_fund: BigInt(100000000), // 1 BTC
        remaining_fund: BigInt(75000000), // 0.75 BTC
        status: AdvertisementStatus.READY,
        is_active: true,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 'ad-002',
        seller_address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        token: 'BTC',
        currency: 'BRL',
        price: BigInt(31800000), // R$ 318.000,00 por BTC
        amount_fund: BigInt(50000000), // 0.5 BTC
        remaining_fund: BigInt(0), // Vendido completamente
        status: AdvertisementStatus.CLOSED,
        is_active: false,
        created_at: '2024-01-10T14:20:00Z',
        updated_at: '2024-01-12T16:45:00Z'
      },
      {
        id: 'ad-003',
        seller_address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        token: 'BTC',
        currency: 'BRL',
        price: BigInt(32500000), // R$ 325.000,00 por BTC
        amount_fund: BigInt(200000000), // 2 BTC
        remaining_fund: BigInt(200000000), // 2 BTC (não vendeu nada ainda)
        status: AdvertisementStatus.PENDING,
        is_active: true,
        created_at: '2024-01-18T09:15:00Z',
        updated_at: '2024-01-18T09:15:00Z'
      },
      {
        id: 'ad-004',
        seller_address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        token: 'BTC',
        currency: 'BRL',
        price: BigInt(31900000), // R$ 319.000,00 por BTC
        amount_fund: BigInt(30000000), // 0.3 BTC
        remaining_fund: BigInt(30000000), // 0.3 BTC
        status: AdvertisementStatus.DISABLED,
        is_active: false,
        created_at: '2024-01-08T11:45:00Z',
        updated_at: '2024-01-16T13:20:00Z'
      }
    ];

    this.myAds.set(mockAds);
  }

  // Computed properties
  filteredAds() {
    const ads = this.myAds();
    const filter = this.selectedFilter();

    if (filter === 'active') {
      return ads.filter(ad => ad.is_active && (ad.status === AdvertisementStatus.READY || ad.status === AdvertisementStatus.PENDING));
    } else if (filter === 'inactive') {
      return ads.filter(ad => !ad.is_active || ad.status === AdvertisementStatus.CLOSED || ad.status === AdvertisementStatus.DISABLED);
    }

    return ads;
  }

  getActiveAdsCount(): number {
    return this.myAds().filter(ad => 
      ad.is_active && (ad.status === AdvertisementStatus.READY || ad.status === AdvertisementStatus.PENDING)
    ).length;
  }

  getTotalEarnings(): number {
    return this.myAds()
      .filter(ad => ad.status === AdvertisementStatus.CLOSED)
      .reduce((total, ad) => {
        const soldAmount = Number(ad.amount_fund - ad.remaining_fund);
        const earnings = (soldAmount / 100000000) * (Number(ad.price) / 100);
        return total + earnings;
      }, 0);
  }

  // Filter methods
  setFilter(filter: 'all' | 'active' | 'inactive') {
    this.selectedFilter.set(filter);
  }

  // Navigation methods
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  createNewAd() {
    this.router.navigate(['/sell']);
  }

  // Ad management methods
  editAd(ad: Advertisement) {
    console.log('Edit ad:', ad.id);
    // TODO: Implement edit functionality
  }

  toggleAdStatus(ad: Advertisement) {
    const ads = this.myAds();
    const updatedAds = ads.map(a => {
      if (a.id === ad.id) {
        return {
          ...a,
          is_active: !a.is_active,
          status: !a.is_active ? AdvertisementStatus.READY : AdvertisementStatus.DISABLED
        };
      }
      return a;
    });
    this.myAds.set(updatedAds);
  }

  deleteAd(ad: Advertisement) {
    if (confirm('Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.')) {
      const ads = this.myAds();
      const updatedAds = ads.filter(a => a.id !== ad.id);
      this.myAds.set(updatedAds);
    }
  }

  // Utility methods
  getStatusClass(status: AdvertisementStatus): string {
    switch (status) {
      case AdvertisementStatus.READY:
        return 'ready';
      case AdvertisementStatus.PENDING:
        return 'pending';
      case AdvertisementStatus.DRAFT:
        return 'draft';
      case AdvertisementStatus.DISABLED:
      case AdvertisementStatus.CLOSED:
        return 'disabled';
      default:
        return 'draft';
    }
  }

  getStatusLabel(status: AdvertisementStatus): string {
    switch (status) {
      case AdvertisementStatus.READY:
        return 'Ativo';
      case AdvertisementStatus.PENDING:
        return 'Pendente';
      case AdvertisementStatus.DRAFT:
        return 'Rascunho';
      case AdvertisementStatus.DISABLED:
        return 'Pausado';
      case AdvertisementStatus.CLOSED:
        return 'Fechado';
      case AdvertisementStatus.BANK_FAILED:
        return 'Erro Bancário';
      case AdvertisementStatus.DEPOSIT_FAILED:
        return 'Falha Depósito';
      default:
        return 'Desconhecido';
    }
  }

  getProgressPercentage(ad: Advertisement): number {
    const total = Number(ad.amount_fund);
    const remaining = Number(ad.remaining_fund);
    if (total === 0) return 0;
    return Math.round(((total - remaining) / total) * 100);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatPriceCurrency(priceBigInt: bigint): string {
    const price = Number(priceBigInt) / 100; // Convert from centavos to reais
    return this.formatCurrency(price);
  }

  formatBTC(satoshisBigInt: bigint): string {
    const satoshis = Number(satoshisBigInt);
    const btc = satoshis / 100000000;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8
    }).format(btc);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }
}
