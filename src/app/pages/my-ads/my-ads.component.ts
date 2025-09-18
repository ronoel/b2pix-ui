import { Component, inject, OnInit, signal, computed, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Advertisement, AdvertisementStatus } from '../../shared/models/advertisement.model';
import { AdvertisementService } from '../../shared/api/advertisement.service';
import { InvitesService } from '../../shared/api/invites.service';
import { WalletService } from '../../libs/wallet.service';
import { LoadingService } from '../../services/loading.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

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
            <button class="refresh-button" (click)="refreshAds()" [disabled]="isLoading()" title="Atualizar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" [class.spinning]="isLoading()">
                <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.49 15C19.9828 16.8412 18.8943 18.4814 17.4001 19.6586C15.9059 20.8357 14.0932 21.4836 12.2188 21.4954C10.3445 21.5072 8.52416 20.8823 7.01362 19.7264C5.50309 18.5705 4.39074 16.9453 3.85848 15.1127C3.32621 13.2801 3.40362 11.3236 4.07803 9.54493C4.75244 7.76625 6.00477 6.2602 7.64736 5.26274C9.28995 4.26528 11.2197 3.83311 13.1294 4.03988C15.0392 4.24665 16.8295 5.08062 18.21 6.39L23 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
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

        <!-- PIX Account Section -->
        <div class="pix-account-section">
          <h2 class="section-title">Conta PIX</h2>
          <div class="pix-account-card">
            <div class="pix-account-content">
              <div class="pix-account-info">
                <div class="pix-account-badge" [ngClass]="{ 
                  'active': bankStatus() === 'success', 
                  'processing': bankStatus() === 'processing',
                  'failed': bankStatus() === 'failed',
                  'inactive': bankStatus() === 'pending' 
                }">
                  <div class="pix-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                      <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="pix-info">
                    <div class="pix-title">Status da Conta PIX</div>
                    <div class="pix-status">{{ getPixStatusMessage() }}</div>
                    <div class="pix-description">
                      {{ getPixDescriptionMessage() }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="pix-account-actions">
                <button class="pix-action-button" (click)="goToPixAccount()" [ngClass]="{ 
                  'primary': bankStatus() === 'pending' || bankStatus() === 'failed', 
                  'secondary': bankStatus() === 'success' || bankStatus() === 'processing' 
                }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H16C17.1046 20 18 19.1046 18 18V11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ getPixButtonText() }}
                </button>
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
            <p class="loading-text">Carregando anúncios...</p>
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
            <h3 class="error-title">Erro ao carregar anúncios</h3>
            <p class="error-description">{{ error() }}</p>
            <button class="retry-button" (click)="loadUserAds()">
              Tentar Novamente
            </button>
          </div>

          <!-- Ads List -->
          <div class="ads-list" *ngIf="!isLoading() && !error() && filteredAds().length > 0">
            <div class="ad-card" *ngFor="let ad of filteredAds()">>
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
                    <span class="amount-value">{{ formatBTC(ad.total_amount) }} BTC</span>
                  </div>
                </div>

                <div class="ad-details">
                  <div class="detail-item">
                    <span class="detail-label">Restante:</span>
                    <span class="detail-value">{{ formatBTC(ad.available_amount) }} BTC</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Criado:</span>
                    <span class="detail-value">{{ formatDate(ad.created_at) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Blockchain:</span>
                    <span class="detail-value">
                      <button 
                        *ngIf="ad.transaction_id"
                        class="blockchain-link" 
                        (click)="openBlockchainExplorer(ad.transaction_id)"
                        title="Ver transação na blockchain"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M18 13V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V8C3 6.89543 3.89543 6 5 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M15 3H21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Ver na Blockchain
                      </button>
                      <span *ngIf="!ad.transaction_id" class="no-transaction">
                        Aguardando transação
                      </span>
                    </span>
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

          <!-- Empty State -->
          <div class="empty-state" *ngIf="!isLoading() && !error() && filteredAds().length === 0">
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

    .refresh-button svg.spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
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

    /* PIX Account Section */
    .pix-account-section {
      margin-bottom: var(--spacing-2xl);
    }

    .pix-account-card {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
    }

    .pix-account-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-xl);
      gap: var(--spacing-lg);
    }

    .pix-account-info {
      flex: 1;
    }

    .pix-account-badge {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--border-radius-lg);
      transition: all var(--transition-normal);
    }

    .pix-account-badge.active {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid var(--success-green);
    }

    .pix-account-badge.processing {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid var(--primary-blue);
    }

    .pix-account-badge.failed {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid #ef4444;
    }

    .pix-account-badge.inactive {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid var(--warning-yellow);
    }

    .pix-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--border-radius-md);
      background: var(--background-elevated);
    }

    .pix-account-badge.active .pix-icon {
      color: var(--success-green);
      background: rgba(34, 197, 94, 0.1);
    }

    .pix-account-badge.processing .pix-icon {
      color: var(--primary-blue);
      background: rgba(59, 130, 246, 0.1);
    }

    .pix-account-badge.failed .pix-icon {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .pix-account-badge.inactive .pix-icon {
      color: var(--warning-yellow);
      background: rgba(245, 158, 11, 0.1);
    }

    .pix-info {
      flex: 1;
    }

    .pix-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .pix-status {
      font-size: var(--font-size-md);
      font-weight: 500;
      margin: 0 0 var(--spacing-xs) 0;
    }

    .pix-account-badge.active .pix-status {
      color: var(--success-green);
    }

    .pix-account-badge.processing .pix-status {
      color: var(--primary-blue);
    }

    .pix-account-badge.failed .pix-status {
      color: #ef4444;
    }

    .pix-account-badge.inactive .pix-status {
      color: var(--warning-yellow);
    }

    .pix-description {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.4;
    }

    .pix-account-actions {
      display: flex;
      align-items: center;
    }

    .pix-action-button {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-lg);
      border: none;
      border-radius: var(--border-radius);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-normal);
      white-space: nowrap;
    }

    .pix-action-button.primary {
      background: var(--primary-color);
      color: white;
    }

    .pix-action-button.primary:hover {
      background: var(--primary-hover);
      transform: translateY(-2px);
    }

    .pix-action-button.secondary {
      background: var(--surface-color);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .pix-action-button.secondary:hover {
      background: var(--background-elevated);
      border-color: var(--primary-color);
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

    .blockchain-link {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: transparent;
      color: var(--primary-color);
      border: 1px solid var(--primary-color);
      border-radius: var(--border-radius);
      font-size: var(--font-size-xs);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .blockchain-link:hover {
      background: var(--primary-color);
      color: white;
      transform: translateY(-1px);
    }

    .blockchain-link svg {
      width: 14px;
      height: 14px;
    }

    .no-transaction {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
      font-style: italic;
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

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: var(--spacing-3xl) var(--spacing-lg);
    }

    .loading-spinner {
      margin: 0 auto var(--spacing-lg);
      color: var(--primary-color);
    }

    .loading-text {
      color: var(--text-secondary);
      margin: 0;
    }

    /* Error State */
    .error-state {
      text-align: center;
      padding: var(--spacing-3xl) var(--spacing-lg);
    }

    .error-icon {
      margin: 0 auto var(--spacing-lg);
      color: #ef4444;
    }

    .error-title {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .error-description {
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-lg) 0;
    }

    .retry-button {
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .retry-button:hover {
      background: var(--primary-hover);
      transform: translateY(-2px);
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
        justify-content: space-between;
      }

      .refresh-button {
        order: 1;
      }

      .create-ad-button {
        order: 2;
        flex: 1;
        margin-left: var(--spacing-md);
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

      .pix-account-content {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-lg);
      }

      .pix-account-badge {
        padding: var(--spacing-md);
        gap: var(--spacing-md);
      }

      .pix-icon {
        width: 40px;
        height: 40px;
      }

      .pix-action-button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class MyAdsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private advertisementService = inject(AdvertisementService);
  private invitesService = inject(InvitesService);
  private walletService = inject(WalletService);
  private loadingService = inject(LoadingService);

  // Signals for reactive state management
  myAds = signal<Advertisement[]>([]);
  selectedFilter = signal<'all' | 'active' | 'inactive'>('all');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  hasPixAccount = false;
  bankStatus = signal<'pending' | 'processing' | 'success' | 'failed'>('pending');

  private subscription?: Subscription;

  // Computed signals
  userAddress = computed(() => this.walletService.walletAddressSignal());

  constructor() {
    // Effect to reload ads when wallet address changes
    effect(() => {
      const address = this.userAddress();
      if (address) {
        this.loadUserAds();
        this.checkPixAccount();
      }
    });
  }

  ngOnInit() {
    // Initial load will be handled by the effect
    this.checkPixAccount();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Load user advertisements from API
  loadUserAds() {
    const address = this.userAddress();
    
    if (!address) {
      this.error.set('Endereço da carteira não encontrado');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    
    this.subscription = this.advertisementService.getAdvertisementByAddress(address).subscribe({
      next: (ads: Advertisement[]) => {
        this.myAds.set(ads);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading user ads:', error);
        this.error.set('Erro ao carregar anúncios. Tente novamente.');
        this.isLoading.set(false);
        // Set empty array on error
        this.myAds.set([]);
      }
    });
  }

  // Computed properties
  filteredAds() {
    const ads = this.myAds();
    const filter = this.selectedFilter();

    let filteredAds: Advertisement[];

    if (filter === 'active') {
      filteredAds = ads.filter(ad => ad.is_active && (ad.status === AdvertisementStatus.READY || ad.status === AdvertisementStatus.PENDING));
    } else if (filter === 'inactive') {
      filteredAds = ads.filter(ad => !ad.is_active || ad.status === AdvertisementStatus.CLOSED || ad.status === AdvertisementStatus.DISABLED);
    } else {
      filteredAds = ads;
    }

    // Sort by creation date - most recent first
    return filteredAds.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order (most recent first)
    });
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
        const soldAmount = Number(ad.total_amount - ad.available_amount);
        const pricePerBtc = Number(ad.price) / 100000000; // Convert price from sats to BRL per BTC
        const earnings = (soldAmount / 100000000) * pricePerBtc;
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

  refreshAds() {
    this.loadUserAds();
    this.checkPixAccount();
  }

  goToPixAccount() {
    this.router.navigate(['/pix-account']);
  }

  // PIX Account methods
  private checkPixAccount() {
    this.invitesService.getWalletInvite().subscribe({
      next: (invite) => {
        if (invite) {
          this.bankStatus.set(invite.bank_status);
          // 'success' indica que a conta PIX foi configurada com sucesso
          this.hasPixAccount = invite.bank_status === 'success';
        } else {
          this.bankStatus.set('pending');
          this.hasPixAccount = false;
        }
      },
      error: (error) => {
        console.error('Error checking PIX account status:', error);
        this.bankStatus.set('failed');
        this.hasPixAccount = false;
      }
    });
  }

  getPixStatusMessage(): string {
    switch (this.bankStatus()) {
      case 'success':
        return 'Conta Ativa';
      case 'processing':
        return 'Em Processamento';
      case 'failed':
        return 'Falha na Configuração';
      case 'pending':
      default:
        return 'Conta Pendente';
    }
  }

  getPixDescriptionMessage(): string {
    switch (this.bankStatus()) {
      case 'success':
        return 'Sua conta PIX está configurada e ativa para transações.';
      case 'processing':
        return 'Sua conta PIX está sendo processada. Aguarde a confirmação.';
      case 'failed':
        return 'Houve um erro na configuração da conta PIX. Tente novamente.';
      case 'pending':
      default:
        return 'Configure sua conta PIX para receber pagamentos.';
    }
  }

  getPixButtonText(): string {
    switch (this.bankStatus()) {
      case 'success':
        return 'Editar Conta PIX';
      case 'processing':
        return 'Verificar Status';
      case 'failed':
        return 'Tentar Novamente';
      case 'pending':
      default:
        return 'Configurar Conta PIX';
    }
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
    const total = Number(ad.total_amount);
    const available = Number(ad.available_amount);
    if (total === 0) return 0;
    return Math.round(((total - available) / total) * 100);
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
    const price = Number(priceBigInt) / 100000000; // Convert from sats to BRL per BTC
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

  // Generate blockchain explorer link
  getBlockchainExplorerLink(transactionId: string): string {
    // Add 0x prefix if not present and generate Hiro explorer link
    const txId = transactionId.startsWith('0x') ? transactionId : `0x${transactionId}`;
    const chain = environment.network === 'mainnet' ? 'mainnet' : 'testnet';
    return `https://explorer.hiro.so/txid/${txId}?chain=${chain}`;
  }

  openBlockchainExplorer(transactionId: string): void {
    const url = this.getBlockchainExplorerLink(transactionId);
    window.open(url, '_blank');
  }
}
