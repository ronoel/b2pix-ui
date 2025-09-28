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
    <div class="my-ads-page">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title">Meus Anúncios</h1>
            <p class="page-subtitle">Gerencie todos os seus anúncios de Bitcoin</p>
          </div>
          <div class="header-actions">
            <button class="refresh-button" (click)="loadUserAds()" [disabled]="isLoading()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" [class.spinning]="isLoading()">
                <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="create-ad-button" (click)="createNewAd()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
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
    /* Global text selection fix */
    .my-ads-page ::selection {
      background: #3B82F6;
      color: #FFFFFF;
    }

    .my-ads-page ::-moz-selection {
      background: #3B82F6;
      color: #FFFFFF;
    }

    .my-ads-page {
      min-height: 100vh;
      background: #F8FAFC;
      padding: 0;
    }

    .my-ads-page .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    /* Header */
    .my-ads-page .page-header {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 32px 0;
      margin-bottom: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 24px;
      margin: 0 -16px 40px -16px;
      padding: 32px 32px;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .my-ads-page .page-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
      backdrop-filter: blur(20px);
      z-index: -1;
    }

    .my-ads-page .header-content {
      flex: 1;
    }

    .my-ads-page .page-title {
      font-size: 32px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0 0 8px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .my-ads-page .page-subtitle {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      font-weight: 400;
    }

    .my-ads-page .header-actions {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .my-ads-page .refresh-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 16px;
      color: #FFFFFF;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(20px);
    }

    .my-ads-page .refresh-button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .my-ads-page .refresh-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .my-ads-page .refresh-button svg {
      transition: transform 0.3s ease;
    }

    .my-ads-page .refresh-button:hover:not(:disabled) svg {
      transform: rotate(180deg);
    }

    .my-ads-page .create-ad-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
      border: none;
      border-radius: 16px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    }

    .my-ads-page .create-ad-button:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.6);
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }

    /* Stats Section */
    .my-ads-page .stats-section {
      margin-bottom: 32px;
    }

    .my-ads-page .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .my-ads-page .stat-card {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 28px;
      border: 1px solid #E5E7EB;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .my-ads-page .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899);
    }

    .my-ads-page .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      border-color: #3B82F6;
    }

    .my-ads-page .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }

    .my-ads-page .stat-icon::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 18px;
      padding: 2px;
      background: linear-gradient(135deg, currentColor, transparent);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
    }

    .my-ads-page .stat-icon.active {
      background: linear-gradient(135deg, #DCFCE7, #A7F3D0);
      color: #059669;
    }

    .my-ads-page .stat-icon.total {
      background: linear-gradient(135deg, #DBEAFE, #93C5FD);
      color: #2563EB;
    }

    .my-ads-page .stat-icon.earnings {
      background: linear-gradient(135deg, #F3E8FF, #C4B5FD);
      color: #7C3AED;
    }

    .my-ads-page .stat-content {
      flex: 1;
    }

    .my-ads-page .stat-value {
      font-size: 28px;
      font-weight: 800;
      color: #1F2937;
      margin-bottom: 4px;
      background: linear-gradient(135deg, #1F2937, #4B5563);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .my-ads-page .stat-label {
      color: #6B7280;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* PIX Account Section */
    .my-ads-page .pix-account-section {
      margin-bottom: 32px;
    }

    .my-ads-page .pix-account-card {
      background: #FFFFFF;
      border-radius: 20px;
      border: 1px solid #E5E7EB;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .my-ads-page .pix-account-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #F59E0B, #EF4444, #EC4899);
    }

    .my-ads-page .pix-account-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .my-ads-page .pix-account-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 28px;
      gap: 24px;
    }

    .my-ads-page .pix-account-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .my-ads-page .pix-icon {
      width: 56px;
      height: 56px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }

    .my-ads-page .pix-icon::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 18px;
      padding: 2px;
      background: linear-gradient(135deg, currentColor, transparent);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
    }

    .my-ads-page .pix-icon.success {
      background: linear-gradient(135deg, #DCFCE7, #A7F3D0);
      color: #059669;
    }

    .my-ads-page .pix-icon.processing {
      background: linear-gradient(135deg, #DBEAFE, #93C5FD);
      color: #2563EB;
    }

    .my-ads-page .pix-icon.error {
      background: linear-gradient(135deg, #FEE2E2, #FECACA);
      color: #DC2626;
    }

    .my-ads-page .pix-icon.warning {
      background: linear-gradient(135deg, #FEF3C7, #FDE68A);
      color: #D97706;
    }

    .my-ads-page .pix-info {
      flex: 1;
    }

    .my-ads-page .pix-title {
      font-size: 18px;
      font-weight: 700;
      color: #1F2937;
      margin-bottom: 6px;
    }

    .my-ads-page .pix-status {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .my-ads-page .pix-account-badge.success .pix-status {
      color: #059669;
    }

    .my-ads-page .pix-account-badge.processing .pix-status {
      color: #2563EB;
    }

    .my-ads-page .pix-account-badge.failed .pix-status {
      color: #DC2626;
    }

    .my-ads-page .pix-account-badge.inactive .pix-status {
      color: #D97706;
    }

    .my-ads-page .pix-description {
      font-size: 14px;
      color: #6B7280;
      margin: 0;
      line-height: 1.5;
    }

    .my-ads-page .pix-action-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 14px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .my-ads-page .pix-action-button.primary {
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      color: #FFFFFF;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    }

    .my-ads-page .pix-action-button.primary:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
      background: linear-gradient(135deg, #1D4ED8, #1E40AF);
    }

    .my-ads-page .pix-action-button.secondary {
      background: rgba(107, 114, 128, 0.1);
      color: #374151;
      border: 2px solid #E5E7EB;
    }

    .my-ads-page .pix-action-button.secondary:hover {
      background: rgba(107, 114, 128, 0.2);
      border-color: #3B82F6;
      transform: translateY(-2px) scale(1.02);
    }

    /* Ads Section */
    .my-ads-page .ads-section {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 32px;
      border: 1px solid #E5E7EB;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: hidden;
    }

    .my-ads-page .ads-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8B5CF6, #3B82F6, #10B981);
    }

    .my-ads-page .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .my-ads-page .section-title {
      font-size: 24px;
      font-weight: 800;
      color: #1F2937;
      margin: 0;
      background: linear-gradient(135deg, #1F2937, #4B5563);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .my-ads-page .filter-buttons {
      display: flex;
      gap: 4px;
      background: #F8FAFC;
      padding: 6px;
      border-radius: 16px;
      border: 1px solid #E2E8F0;
    }

    .my-ads-page .filter-button {
      padding: 10px 16px;
      background: transparent;
      color: #64748B;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .my-ads-page .filter-button.active {
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      color: #FFFFFF;
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    }

    .my-ads-page .filter-button:hover:not(.active) {
      background: rgba(59, 130, 246, 0.1);
      color: #3B82F6;
      transform: translateY(-1px);
    }

    /* Ad Cards */
    .my-ads-page .ads-list {
      display: grid;
      gap: 20px;
    }

    .my-ads-page .ad-card {
      background: #FFFFFF;
      border: 2px solid #E5E7EB;
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .my-ads-page .ad-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #10B981, #059669, #047857);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .my-ads-page .ad-card:hover {
      border-color: #3B82F6;
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(59, 130, 246, 0.2);
    }

    .my-ads-page .ad-card:hover::before {
      opacity: 1;
    }

    .my-ads-page .ad-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
      border-bottom: 1px solid #E5E7EB;
    }

    .my-ads-page .ad-status-badge {
      padding: 6px 16px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      position: relative;
      overflow: hidden;
    }

    .my-ads-page .ad-status-badge::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      transition: left 0.5s;
    }

    .my-ads-page .ad-status-badge:hover::before {
      left: 100%;
    }

    .my-ads-page .ad-status-badge.ready {
      background: linear-gradient(135deg, #DCFCE7, #BBF7D0);
      color: #047857;
      border: 2px solid #A7F3D0;
    }

    .my-ads-page .ad-status-badge.pending {
      background: linear-gradient(135deg, #FEF3C7, #FDE68A);
      color: #92400E;
      border: 2px solid #F59E0B;
    }

    .my-ads-page .ad-status-badge.draft {
      background: linear-gradient(135deg, #F3F4F6, #E5E7EB);
      color: #374151;
      border: 2px solid #9CA3AF;
    }

    .my-ads-page .ad-status-badge.disabled {
      background: linear-gradient(135deg, #FEE2E2, #FECACA);
      color: #991B1B;
      border: 2px solid #F87171;
    }

    .my-ads-page .action-button {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(59, 130, 246, 0.1);
      border: 2px solid #3B82F6;
      border-radius: 12px;
      color: #3B82F6;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .my-ads-page .action-button:hover {
      background: #3B82F6;
      color: #FFFFFF;
      transform: translateY(-2px) scale(1.1);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
    }

    .my-ads-page .ad-content {
      padding: 28px;
    }

    .my-ads-page .ad-main-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 28px;
    }

    .my-ads-page .ad-price,
    .my-ads-page .ad-amount {
      text-align: left;
      padding: 20px;
      background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
      border-radius: 16px;
      border: 1px solid #E2E8F0;
      transition: all 0.3s ease;
    }

    .my-ads-page .ad-price:hover,
    .my-ads-page .ad-amount:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .my-ads-page .price-label,
    .my-ads-page .amount-label {
      font-size: 12px;
      color: #64748B;
      font-weight: 700;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .my-ads-page .price-value {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #059669, #047857);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .my-ads-page .amount-value {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #1F2937, #374151);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .my-ads-page .ad-details {
      background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      border: 2px solid #E2E8F0;
      transition: all 0.3s ease;
    }

    .my-ads-page .ad-details:hover {
      border-color: #3B82F6;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
    }

    .my-ads-page .detail-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 16px;
    }

    .my-ads-page .detail-row:last-child {
      margin-bottom: 0;
    }

    .my-ads-page .detail-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 10px;
      transition: all 0.3s ease;
    }

    .my-ads-page .detail-item:hover {
      background: rgba(255, 255, 255, 1);
      transform: translateY(-1px);
    }

    .my-ads-page .blockchain-item {
      grid-column: 1 / -1;
    }

    .my-ads-page .detail-label {
      font-size: 11px;
      color: #64748B;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .my-ads-page .detail-value {
      font-weight: 700;
      color: #1F2937;
      font-size: 14px;
    }

    .my-ads-page .blockchain-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      padding: 8px 12px;
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      color: #FFFFFF;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .my-ads-page .blockchain-link:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
      background: linear-gradient(135deg, #1D4ED8, #1E40AF);
    }

    .my-ads-page .ad-progress {
      margin-top: 20px;
      padding: 16px;
      background: linear-gradient(135deg, #F0F9FF, #E0F2FE);
      border-radius: 12px;
      border: 1px solid #BAE6FD;
    }

    .my-ads-page .progress-bar {
      width: 100%;
      height: 8px;
      background: #E2E8F0;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 12px;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .my-ads-page .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #10B981, #059669, #047857);
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 6px;
      position: relative;
    }

    .my-ads-page .progress-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .my-ads-page .progress-text {
      font-size: 12px;
      color: #047857;
      text-align: center;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Loading State */
    .my-ads-page .loading-state {
      text-align: center;
      padding: 64px 24px;
      background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
      border-radius: 20px;
      border: 2px dashed #CBD5E1;
    }

    .my-ads-page .loading-spinner {
      margin: 0 auto 24px;
      color: #3B82F6;
    }

    .my-ads-page .loading-text {
      color: #64748B;
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    /* Error State */
    .my-ads-page .error-state {
      text-align: center;
      padding: 64px 24px;
      background: linear-gradient(135deg, #FEF2F2, #FEE2E2);
      border-radius: 20px;
      border: 2px solid #FCA5A5;
    }

    .my-ads-page .error-icon {
      margin: 0 auto 24px;
      color: #DC2626;
    }

    .my-ads-page .error-title {
      font-size: 22px;
      font-weight: 800;
      color: #991B1B;
      margin: 0 0 12px 0;
    }

    .my-ads-page .error-description {
      color: #B91C1C;
      margin: 0 0 28px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .my-ads-page .retry-button {
      padding: 12px 24px;
      background: linear-gradient(135deg, #DC2626, #B91C1C);
      color: #FFFFFF;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .my-ads-page .retry-button:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
      background: linear-gradient(135deg, #B91C1C, #991B1B);
    }

    /* Empty State */
    .my-ads-page .empty-state {
      text-align: center;
      padding: 64px 24px;
      background: linear-gradient(135deg, #FAFAFA, #F4F4F5);
      border-radius: 20px;
      border: 2px dashed #D4D4D8;
    }

    .my-ads-page .empty-icon {
      margin: 0 auto 28px;
      color: #A1A1AA;
    }

    .my-ads-page .empty-title {
      font-size: 22px;
      font-weight: 800;
      color: #27272A;
      margin: 0 0 12px 0;
    }

    .my-ads-page .empty-description {
      color: #71717A;
      margin: 0 0 28px 0;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
      font-size: 16px;
      line-height: 1.6;
      font-weight: 500;
    }

    .my-ads-page .empty-action-button {
      padding: 14px 28px;
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      color: #FFFFFF;
      border: none;
      border-radius: 14px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .my-ads-page .empty-action-button:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
      background: linear-gradient(135deg, #1D4ED8, #1E40AF);
    }

    /* Animations */
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .my-ads-page .spinning {
      animation: spin 1s linear infinite;
    }

    .my-ads-page .fade-in {
      animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .my-ads-page .pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    /* Enhanced button styles */
    button {
      position: relative;
      overflow: hidden;
    }

    button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    button:hover::before {
      left: 100%;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .my-ads-page .container {
        padding: 0 12px;
      }

      .my-ads-page .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .my-ads-page .header-content {
        width: 100%;
      }

      .my-ads-page .page-title {
        font-size: 24px;
      }

      .my-ads-page .header-actions {
        width: 100%;
        justify-content: space-between;
      }

      .my-ads-page .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .my-ads-page .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .my-ads-page .filter-buttons {
        width: 100%;
        justify-content: space-between;
      }

      .my-ads-page .ad-main-info {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .my-ads-page .detail-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .my-ads-page .pix-account-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .my-ads-page .pix-account-actions {
        width: 100%;
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
