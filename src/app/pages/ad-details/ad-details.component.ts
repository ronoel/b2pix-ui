import { Component, inject, OnInit, signal, computed, ViewEncapsulation } from '@angular/core';
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
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="ad-details-modern">
      <div class="container">
        <div class="page-header">
          <button class="btn btn-ghost" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Voltar
          </button>
          <div class="header-content">
            <h1 class="page-title">Detalhes do Anúncio</h1>
            <p class="page-subtitle">Visualize as informações do anúncio e suas vendas</p>
          </div>
          <button class="btn btn-outline btn-sm" (click)="refreshData()" [disabled]="isLoading()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 12C3 7.02944 7.02944 3 12 3C14.5755 3 16.9 4.15205 18.5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C9.42446 21 7.09995 19.848 5.5 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M13 2L18 6L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M11 22L6 18L10 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Atualizar
          </button>
        </div>

        <div class="loading-state" *ngIf="isLoading()">
          <div class="loading-spinner"></div>
          <p>Carregando dados do anúncio...</p>
        </div>

        <div class="error-state" *ngIf="error() && !isLoading()">
          <div class="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Erro ao carregar dados</h3>
          <p>{{ error() }}</p>
          <button class="btn btn-primary" (click)="retryLoadData()">Tentar Novamente</button>
        </div>

        <div class="ad-section" *ngIf="!isLoading() && !error() && advertisement()">
          <div class="ad-card">
            <div class="ad-header">
              <div class="ad-status-badge" [ngClass]="getStatusClass(advertisement()!.status)">
                {{ getStatusLabel(advertisement()!.status) }}
              </div>
              <div class="ad-actions" *ngIf="canFinishAdvertisement()">
                <button class="btn btn-danger btn-sm" (click)="finishAdvertisement()" [disabled]="isFinishing()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" *ngIf="!isFinishing()">
                    <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span *ngIf="isFinishing()" class="loading-spinner-sm"></span>
                  {{ isFinishing() ? 'Finalizando...' : 'Finalizar Anúncio' }}
                </button>
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
              <div class="ad-details-grid">
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
                    <button *ngIf="advertisement()!.transaction_id" class="blockchain-link" (click)="openBlockchainExplorer(advertisement()!.transaction_id!)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M18 13V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V8C3 6.89543 3.89543 6 5 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M15 3H21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Ver na Blockchain
                    </button>
                    <span *ngIf="!advertisement()!.transaction_id" class="no-transaction">Aguardando transação</span>
                  </span>
                </div>
              </div>
              <div class="ad-progress" *ngIf="advertisement()!.status === 'ready'">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="getProgressPercentage(advertisement()!)"></div>
                </div>
                <div class="progress-text">{{ getProgressPercentage(advertisement()!) }}% vendido</div>
              </div>
            </div>
          </div>
        </div>

        <div class="buys-section" *ngIf="!isLoading() && !error() && advertisement()">
          <div class="section-header">
            <h2 class="section-title">Vendas Realizadas</h2>
            <div class="buys-count">{{ buys().length }} vendas</div>
          </div>
          <div class="buys-list" *ngIf="buys().length > 0">
            <div class="buy-card" *ngFor="let buy of buys()">
              <div class="buy-header">
                <div class="buy-id">ID: {{ buy.id.substring(0, 8) }}...</div>
                <div class="buy-status-badge" [ngClass]="getBuyStatusClass(buy.status)">{{ getBuyStatusLabel(buy.status) }}</div>
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
                <div class="buy-details-grid">
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
          <div class="empty-state" *ngIf="buys().length === 0">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M8 14S9.5 16 12 16S16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 9H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 9H15.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Nenhuma venda realizada</h3>
            <p>Este anúncio ainda não possui vendas realizadas.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ad-details-modern {
      min-height: 100vh;
      background: #F8FAFC;
      padding: 0;
      font-family: var(--font-family-primary);
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }
    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px 0;
      margin-bottom: 32px;
    }
    .header-content {
      flex: 1;
    }
    .page-title {
      font-size: 30px;
      font-weight: 700;
      color: #1F2937;
      margin: 0 0 8px 0;
    }
    .page-subtitle {
      font-size: 16px;
      color: #6B7280;
      margin: 0;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-primary {
      background: #1E40AF;
      color: white;
      border-color: #1E40AF;
    }
    .btn-primary:hover:not(:disabled) {
      background: #1D4ED8;
    }
    .btn-danger {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
    }
    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }
    .btn-outline {
      background: transparent;
      color: #374151;
      border-color: #D1D5DB;
    }
    .btn-outline:hover:not(:disabled) {
      background: #F9FAFB;
    }
    .btn-ghost {
      background: transparent;
      color: #6B7280;
      border: none;
    }
    .btn-ghost:hover:not(:disabled) {
      background: #F3F4F6;
      color: #374151;
    }
    .btn-sm {
      padding: 8px 16px;
      font-size: 12px;
    }
    .ad-section {
      margin-bottom: 32px;
    }
    .ad-card {
      background: #FFFFFF;
      border: 2px solid #E5E7EB;
      border-radius: 16px;
      padding: 24px;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    .ad-card:hover {
      border-color: #1E40AF;
      box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1);
      transform: translateY(-2px);
    }
    .ad-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      position: relative;
    }
    .ad-status-badge {
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #F9FAFB;
      color: #059669;
      border: 1px solid #A7F3D0;
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
    .ad-status-badge.closed {
      background: #ef444420;
      color: #ef4444;
    }
    .ad-actions {
      display: flex;
      gap: 8px;
    }
    .ad-content {
      padding: 0 0 16px 0;
    }
    .ad-main-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #E5E7EB;
    }
    .ad-price, .ad-amount {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .price-label, .amount-label {
      color: #6B7280;
      font-size: 14px;
    }
    .price-value {
      font-size: 22px;
      font-weight: 700;
      color: #F59E0B;
    }
    .amount-value {
      font-size: 22px;
      font-weight: 700;
      color: #1E40AF;
    }
    .ad-details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .detail-label {
      color: #6B7280;
      font-size: 13px;
    }
    .detail-value {
      color: #1F2937;
      font-weight: 500;
    }
    .blockchain-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #1E40AF;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 4px 12px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .blockchain-link:hover {
      background: #1D4ED8;
    }
    .no-transaction {
      color: #9CA3AF;
      font-style: italic;
    }
    .ad-progress {
      margin-top: 16px;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #E5E7EB;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 6px;
    }
    .progress-fill {
      height: 100%;
      background: #1E40AF;
      transition: width 0.3s ease;
    }
    .progress-text {
      text-align: center;
      color: #6B7280;
      font-size: 13px;
    }
    .buys-section {
      margin-bottom: 32px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #1F2937;
      margin: 0;
    }
    .buys-count {
      color: #6B7280;
      font-size: 14px;
      padding: 6px 16px;
      background: #F9FAFB;
      border-radius: 9999px;
    }
    .buys-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .buy-card {
      background: #FFFFFF;
      border: 2px solid #E5E7EB;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.2s ease;
      position: relative;
      padding: 16px;
    }
    .buy-card:hover {
      border-color: #1E40AF;
      box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1);
      transform: translateY(-2px);
    }
    .buy-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      position: relative;
    }
    .buy-id {
      font-family: monospace;
      color: #6B7280;
      font-size: 13px;
    }
    .buy-status-badge {
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #F9FAFB;
      color: #059669;
      border: 1px solid #A7F3D0;
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
      padding: 0 0 8px 0;
    }
    .buy-amounts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #E5E7EB;
    }
    .amount-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .buy-details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      text-align: center;
      background: #FFFFFF;
      border-radius: 16px;
      border: 2px dashed #E5E7EB;
    }
    .empty-icon {
      color: #9CA3AF;
      margin-bottom: 16px;
    }
    .empty-state h3 {
      font-size: 18px;
      color: #1F2937;
      margin: 0;
    }
    .empty-state p {
      color: #6B7280;
      margin: 0;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      text-align: center;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #E5E7EB;
      border-top: 3px solid #1E40AF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    .loading-spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      display: inline-block;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @media (max-width: 768px) {
      .container {
        padding: 0 12px;
      }
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      .ad-main-info, .buy-amounts {
        grid-template-columns: 1fr;
      }
      .ad-details-grid, .buy-details-grid {
        grid-template-columns: 1fr;
      }
      .ad-card, .buy-card {
        padding: 16px;
      }
      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .modal-actions {
        flex-direction: column;
      }
    }
    @media (max-width: 480px) {
      .ad-main-info, .buy-amounts {
        grid-template-columns: 1fr;
      }
      .ad-details-grid, .buy-details-grid {
        grid-template-columns: 1fr;
      }
      .buys-list {
        gap: 8px;
      }
      .ad-card, .buy-card {
        padding: 8px;
      }
      .empty-state {
        padding: 24px;
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
  public isFinishing = signal(false);
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

  canFinishAdvertisement(): boolean {
    const ad = this.advertisement();
    if (!ad) return false;
    
    // Can only finish advertisements that are READY or PENDING
    return ad.status === AdvertisementStatus.READY || ad.status === AdvertisementStatus.PENDING;
  }

  finishAdvertisement() {
    const ad = this.advertisement();
    if (!ad || !this.canFinishAdvertisement()) return;

    const confirmMessage = `Tem certeza que deseja finalizar este anúncio?
    
Esta ação irá:
• Fechar o anúncio permanentemente
• Impedir novas compras
• Requerer assinatura da carteira

Esta ação não pode ser desfeita.`;

    if (confirm(confirmMessage)) {
      this.isFinishing.set(true);
      
      this.advertisementService.finishAdvertisement(ad.id).subscribe({
        next: (updatedAd: Advertisement) => {
          this.advertisement.set(updatedAd);
          this.isFinishing.set(false);
          
          // Show success message
          alert('Anúncio finalizado com sucesso!');
        },
        error: (error: any) => {
          console.error('Error finishing advertisement:', error);
          this.isFinishing.set(false);
          
          // Show error message
          const errorMessage = error.message || 'Erro ao finalizar anúncio. Tente novamente.';
          alert(errorMessage);
        }
      });
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
      case AdvertisementStatus.CLOSED:
        return 'closed';
      case AdvertisementStatus.DISABLED:
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