import { Component, inject, OnInit, signal, computed, OnDestroy, effect, ViewEncapsulation } from '@angular/core';
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
  encapsulation: ViewEncapsulation.None,
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
                  <button class="action-button" (click)="viewAdDetails(ad)" title="Ver detalhes">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
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
                    <span class="detail-label">Valor Mínimo:</span>
                    <span class="detail-value">{{ formatCentsToReais(ad.min_amount) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Valor Máximo:</span>
                    <span class="detail-value">{{ formatCentsToReais(ad.max_amount) }}</span>
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
    /* Container and Global Layout */
    .my-ads {
      min-height: 100vh;
      background: #0a0a0a;
      padding: 32px 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Page Header Section */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 48px;
      padding-bottom: 24px;
      border-bottom: 1px solid #1e1e1e;
      background: linear-gradient(135deg, rgba(248, 113, 113, 0.02), rgba(251, 146, 60, 0.02));
      border-radius: 16px;
      padding: 24px;
      backdrop-filter: blur(10px);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .back-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: #151515;
      border: 1px solid #2d2d2d;
      border-radius: 12px;
      color: #8a8a8a;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .back-button:hover {
      background: linear-gradient(135deg, #f87171, #fb923c);
      border-color: #f87171;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(248, 113, 113, 0.3);
    }

    .header-content {
      flex: 1;
    }

    .page-title {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px 0;
      background: linear-gradient(135deg, #f87171, #fb923c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .page-subtitle {
      color: #8a8a8a;
      margin: 0;
      font-size: 16px;
      font-weight: 400;
    }

    .header-right {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .refresh-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: #151515;
      border: 1px solid #2d2d2d;
      border-radius: 12px;
      color: #8a8a8a;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .refresh-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #f87171, #fb923c);
      border-color: #f87171;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(248, 113, 113, 0.3);
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
      gap: 12px;
      padding: 14px 24px;
      background: linear-gradient(135deg, #f87171, #fb923c);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 16px rgba(248, 113, 113, 0.3);
    }

    .create-ad-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(248, 113, 113, 0.4);
      background: linear-gradient(135deg, #ef4444, #f97316);
    }

    /* Stats Section */
    .stats-section {
      margin-bottom: 48px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .stat-card {
      background: linear-gradient(135deg, #151515, #1a1a1a);
      border: 1px solid #2d2d2d;
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(248, 113, 113, 0.5), transparent);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      border-color: #f87171;
      box-shadow: 0 12px 40px rgba(248, 113, 113, 0.15);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-icon.active {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
      color: #22c55e;
      box-shadow: 0 8px 24px rgba(34, 197, 94, 0.2);
    }

    .stat-icon.total {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));
      color: #3b82f6;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
    }

    .stat-icon.earnings {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05));
      color: #a855f7;
      box-shadow: 0 8px 24px rgba(168, 85, 247, 0.2);
    }

    .stat-content {
      flex: 1;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
      background: linear-gradient(135deg, #ffffff, #d1d5db);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      color: #8a8a8a;
      font-size: 14px;
      font-weight: 500;
    }

    /* PIX Account Section */
    .pix-account-section {
      margin-bottom: 48px;
    }

    .section-title {
      font-size: 24px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 20px 0;
    }

    .pix-account-card {
      background: linear-gradient(135deg, #151515, #1a1a1a);
      border: 1px solid #2d2d2d;
      border-radius: 16px;
      overflow: hidden;
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .pix-account-card:hover {
      border-color: #f87171;
      box-shadow: 0 12px 40px rgba(248, 113, 113, 0.1);
    }

    .pix-account-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 32px;
      gap: 24px;
    }

    .pix-account-info {
      flex: 1;
    }

    .pix-account-badge {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px 24px;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid transparent;
    }

    .pix-account-badge.active {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
      border-color: rgba(34, 197, 94, 0.3);
    }

    .pix-account-badge.processing {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
      border-color: rgba(59, 130, 246, 0.3);
    }

    .pix-account-badge.failed {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
      border-color: rgba(239, 68, 68, 0.3);
    }

    .pix-account-badge.inactive {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
      border-color: rgba(245, 158, 11, 0.3);
    }

    .pix-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: #0a0a0a;
      flex-shrink: 0;
    }

    .pix-account-badge.active .pix-icon {
      color: #22c55e;
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
      box-shadow: 0 8px 24px rgba(34, 197, 94, 0.2);
    }

    .pix-account-badge.processing .pix-icon {
      color: #3b82f6;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
    }

    .pix-account-badge.failed .pix-icon {
      color: #ef4444;
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.2);
    }

    .pix-account-badge.inactive .pix-icon {
      color: #f59e0b;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05));
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.2);
    }

    .pix-info {
      flex: 1;
    }

    .pix-title {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 8px 0;
    }

    .pix-status {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 8px 0;
    }

    .pix-account-badge.active .pix-status {
      color: #22c55e;
    }

    .pix-account-badge.processing .pix-status {
      color: #3b82f6;
    }

    .pix-account-badge.failed .pix-status {
      color: #ef4444;
    }

    .pix-account-badge.inactive .pix-status {
      color: #f59e0b;
    }

    .pix-description {
      font-size: 14px;
      color: #8a8a8a;
      margin: 0;
      line-height: 1.5;
    }

    .pix-account-actions {
      display: flex;
      align-items: center;
    }

    .pix-action-button {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 20px;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
    }

    .pix-action-button.primary {
      background: linear-gradient(135deg, #f87171, #fb923c);
      color: white;
      box-shadow: 0 4px 16px rgba(248, 113, 113, 0.3);
    }

    .pix-action-button.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(248, 113, 113, 0.4);
    }

    .pix-action-button.secondary {
      background: #151515;
      color: #ffffff;
      border: 1px solid #2d2d2d;
    }

    .pix-action-button.secondary:hover {
      background: #1e1e1e;
      border-color: #f87171;
      transform: translateY(-2px);
    }

    /* Ads Section */
    .ads-section {
      background: linear-gradient(135deg, rgba(248, 113, 113, 0.02), rgba(251, 146, 60, 0.02));
      border-radius: 16px;
      padding: 32px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(248, 113, 113, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .filter-buttons {
      display: flex;
      gap: 8px;
      background: #0a0a0a;
      padding: 6px;
      border-radius: 12px;
      border: 1px solid #1e1e1e;
    }

    .filter-button {
      padding: 10px 20px;
      background: transparent;
      color: #8a8a8a;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 14px;
      font-weight: 500;
    }

    .filter-button.active,
    .filter-button:hover {
      background: linear-gradient(135deg, #f87171, #fb923c);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
    }

    /* Ad Cards */
    .ads-list {
      display: grid;
      gap: 24px;
    }

    .ad-card {
      background: linear-gradient(135deg, #151515, #1a1a1a);
      border: 1px solid #2d2d2d;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
      position: relative;
    }

    .ad-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(248, 113, 113, 0.3), transparent);
    }

    .ad-card:hover {
      border-color: #f87171;
      transform: translateY(-4px);
      box-shadow: 0 16px 48px rgba(248, 113, 113, 0.15);
    }

    .ad-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
      border-bottom: 1px solid #2d2d2d;
    }

    .ad-status-badge {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ad-status-badge.ready {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05));
      color: #22c55e;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .ad-status-badge.pending {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.05));
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .ad-status-badge.draft {
      background: linear-gradient(135deg, rgba(156, 163, 175, 0.15), rgba(156, 163, 175, 0.05));
      color: #9ca3af;
      border: 1px solid rgba(156, 163, 175, 0.3);
    }

    .ad-status-badge.disabled {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .ad-actions {
      display: flex;
      gap: 8px;
    }

    .action-button {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid #2d2d2d;
      border-radius: 10px;
      color: #8a8a8a;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .action-button:hover {
      background: linear-gradient(135deg, #f87171, #fb923c);
      border-color: #f87171;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(248, 113, 113, 0.3);
    }

    .action-button.delete:hover {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border-color: #ef4444;
    }

    .ad-content {
      padding: 24px;
    }

    .ad-main-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 24px;
    }

    .ad-price,
    .ad-amount {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .price-label,
    .amount-label {
      font-size: 14px;
      color: #8a8a8a;
      font-weight: 500;
    }

    .price-value {
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #f87171, #fb923c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .amount-value {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
    }

    .ad-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
      padding: 20px;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
      border-radius: 12px;
      border: 1px solid #1e1e1e;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .detail-label {
      font-size: 12px;
      color: #8a8a8a;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-weight: 600;
      color: #ffffff;
      font-size: 14px;
    }

    .blockchain-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: transparent;
      color: #f87171;
      border: 1px solid #f87171;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
    }

    .blockchain-link:hover {
      background: linear-gradient(135deg, #f87171, #fb923c);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
    }

    .blockchain-link svg {
      width: 14px;
      height: 14px;
    }

    .no-transaction {
      font-size: 12px;
      color: #666666;
      font-style: italic;
    }

    .ad-progress {
      margin-top: 20px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #1e1e1e;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #f87171, #fb923c);
      transition: width 0.3s ease;
      border-radius: 4px;
    }

    .progress-text {
      font-size: 14px;
      color: #8a8a8a;
      text-align: center;
      font-weight: 500;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 64px 24px;
    }

    .loading-spinner {
      margin: 0 auto 24px;
      color: #f87171;
    }

    .loading-text {
      color: #8a8a8a;
      margin: 0;
      font-size: 16px;
    }

    /* Error State */
    .error-state {
      text-align: center;
      padding: 64px 24px;
    }

    .error-icon {
      margin: 0 auto 24px;
      color: #ef4444;
    }

    .error-title {
      font-size: 24px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 12px 0;
    }

    .error-description {
      color: #8a8a8a;
      margin: 0 0 24px 0;
      font-size: 16px;
    }

    .retry-button {
      padding: 14px 28px;
      background: linear-gradient(135deg, #f87171, #fb923c);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 16px rgba(248, 113, 113, 0.3);
    }

    .retry-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(248, 113, 113, 0.4);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 64px 24px;
    }

    .empty-icon {
      margin: 0 auto 24px;
      color: #404040;
    }

    .empty-title {
      font-size: 24px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 12px 0;
    }

    .empty-description {
      color: #8a8a8a;
      margin: 0 0 32px 0;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
      font-size: 16px;
      line-height: 1.5;
    }

    .empty-action-button {
      padding: 14px 28px;
      background: linear-gradient(135deg, #f87171, #fb923c);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 16px rgba(248, 113, 113, 0.3);
    }

    .empty-action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(248, 113, 113, 0.4);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .container {
        padding: 0 16px;
      }

      .my-ads {
        padding: 24px 0;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
        padding: 20px;
      }

      .header-left {
        width: 100%;
        gap: 16px;
      }

      .page-title {
        font-size: 24px;
      }

      .header-right {
        width: 100%;
        justify-content: space-between;
      }

      .create-ad-button {
        flex: 1;
        justify-content: center;
        margin-left: 12px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .stat-card {
        padding: 20px;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .filter-buttons {
        width: 100%;
        justify-content: space-between;
        padding: 4px;
      }

      .filter-button {
        flex: 1;
        text-align: center;
        padding: 8px 12px;
        font-size: 12px;
      }

      .ad-main-info {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .ad-details {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .pix-account-content {
        flex-direction: column;
        align-items: stretch;
        gap: 20px;
        padding: 24px;
      }

      .pix-account-badge {
        padding: 16px;
        gap: 16px;
      }

      .pix-icon {
        width: 48px;
        height: 48px;
      }

      .pix-action-button {
        width: 100%;
        justify-content: center;
      }

      .ads-section {
        padding: 24px 16px;
      }

      .ad-content {
        padding: 20px;
      }

      .ad-header {
        padding: 16px 20px;
      }
    }

    @media (max-width: 480px) {
      .back-button,
      .refresh-button {
        width: 44px;
        height: 44px;
      }

      .stat-icon {
        width: 48px;
        height: 48px;
      }

      .stat-value {
        font-size: 24px;
      }

      .price-value,
      .amount-value {
        font-size: 20px;
      }

      .section-title {
        font-size: 20px;
      }

      .filter-button {
        padding: 6px 8px;
        font-size: 11px;
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
        // Convert from cents per Bitcoin to BRL per Bitcoin
        const priceCentsPerBtc = Number(ad.price);
        const priceReaisPerBtc = priceCentsPerBtc / 100;
        const earnings = (soldAmount / 100000000) * priceReaisPerBtc;
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
  viewAdDetails(ad: Advertisement) {
    this.router.navigate(['/my-ads', ad.id]);
  }

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
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatPriceCurrency(priceBigInt: bigint): string {
    // Convert from cents per Bitcoin to BRL per Bitcoin for display
    // price_cents_per_btc / 100_cents_per_real = price_reais_per_btc
    const priceCentsPerBtc = Number(priceBigInt);
    const priceReaisPerBtc = priceCentsPerBtc / 100;
    return this.formatCurrency(priceReaisPerBtc);
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

  formatCentsToReais(cents: number): string {
    const reais = cents / 100; // Convert cents to reais
    return this.formatCurrency(reais);
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
