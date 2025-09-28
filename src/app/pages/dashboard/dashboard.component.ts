import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="dashboard">
      <div class="container">
        <!-- Header -->
        <div class="dashboard-header">
          <div class="header-left">
            <h1 class="dashboard-title">Dashboard</h1>
            <p class="dashboard-subtitle">Plataforma P2P - Compre e venda Bitcoin com PIX</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <div class="actions-grid">
            <div class="action-card" (click)="goToBuy()">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7 7H17V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="action-content">
                <h3 class="action-title">Comprar Bitcoin</h3>
                <p class="action-description">Encontre as melhores ofertas</p>
              </div>
              <div class="action-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>

            <div class="action-card" (click)="goToSell()">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M17 7L7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M17 17H7V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="action-content">
                <h3 class="action-title">Vender Bitcoin</h3>
                <p class="action-description">Crie seu anúncio de venda</p>
              </div>
              <div class="action-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>

            <div class="action-card" (click)="goToMyAds()">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="action-content">
                <h3 class="action-title">Meus Anúncios</h3>
                <p class="action-description">Gerencie seus anúncios</p>
              </div>
              <div class="action-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="activity-section" *ngIf="recentTransactions().length > 0">
          <h2 class="section-title">Transações Recentes</h2>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let transaction of recentTransactions().slice(0, 3)">
              <div class="activity-icon" [ngClass]="{
                'success': transaction.status === 'completed',
                'info': transaction.status === 'pending',
                'warning': transaction.status === 'processing'
              }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" *ngIf="transaction.status === 'completed'">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" *ngIf="transaction.status === 'pending'">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" *ngIf="transaction.status === 'processing'">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ getTransactionTitle(transaction) }}</div>
                <div class="activity-details">{{ getTransactionDetails(transaction) }}</div>
              </div>
              <div class="activity-time">{{ getTimeAgo(transaction.createdAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Global text selection fix */
    .dashboard ::selection {
      background: #3B82F6;
      color: #FFFFFF;
    }

    .dashboard ::-moz-selection {
      background: #3B82F6;
      color: #FFFFFF;
    }

    /* Container */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .dashboard {
      min-height: 100vh;
      background: #F8FAFC;
      padding: 32px 0;
    }

    /* Header */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 48px;
      padding-bottom: 24px;
      border-bottom: 1px solid #E5E7EB;
    }

    .dashboard-title {
      font-size: 36px;
      font-weight: 700;
      color: #1F2937;
      margin: 0 0 8px 0;
    }

    .dashboard-subtitle {
      font-size: 16px;
      color: #6B7280;
      margin: 0;
    }

    .wallet-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #16A34A;
      color: white;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
    }

    /* Actions Section */
    .actions-section {
      margin-bottom: 48px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 24px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 32px;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
      border-color: #F59E0B;
    }

    .action-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: #F9FAFB;
      color: #F59E0B;
      flex-shrink: 0;
    }

    .action-content {
      flex: 1;
      min-width: 0;
    }

    .action-title {
      font-size: 18px;
      font-weight: 600;
      color: #1F2937;
      margin: 0 0 8px 0;
    }

    .action-description {
      font-size: 14px;
      color: #6B7280;
      margin: 0;
      line-height: 1.5;
    }

    .action-arrow {
      color: #9CA3AF;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .action-card:hover .action-arrow {
      color: #F59E0B;
      transform: translateX(4px);
    }

    /* Activity Section */
    .activity-section {
      margin-bottom: 48px;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 24px;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .activity-item:hover {
      background: #F9FAFB;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06);
    }

    .activity-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      color: white;
      flex-shrink: 0;
    }

    .activity-icon.success {
      background: #16A34A;
    }

    .activity-icon.info {
      background: #1E40AF;
    }

    .activity-icon.warning {
      background: #F59E0B;
    }

    .activity-content {
      flex: 1;
      min-width: 0;
    }

    .activity-title {
      font-size: 16px;
      font-weight: 500;
      color: #1F2937;
      margin: 0 0 8px 0;
    }

    .activity-details {
      font-size: 14px;
      color: #6B7280;
      margin: 0;
      line-height: 1.5;
    }

    .activity-time {
      font-size: 12px;
      color: #9CA3AF;
      white-space: nowrap;
      font-weight: 500;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .dashboard {
        padding: 24px 0;
      }

      .container {
        padding: 0 12px;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
        margin-bottom: 32px;
        padding-bottom: 16px;
      }

      .dashboard-title {
        font-size: 28px;
      }

      .dashboard-subtitle {
        font-size: 14px;
      }

      .actions-section {
        margin-bottom: 32px;
      }

      .actions-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .action-card {
        padding: 24px;
        gap: 16px;
      }

      .action-icon {
        width: 48px;
        height: 48px;
      }

      .action-title {
        font-size: 16px;
      }

      .action-description {
        font-size: 13px;
      }

      .activity-section {
        margin-bottom: 32px;
      }

      .activity-item {
        padding: 16px;
        gap: 16px;
      }

      .activity-icon {
        width: 36px;
        height: 36px;
      }

      .activity-title {
        font-size: 15px;
      }

      .activity-details {
        font-size: 13px;
      }

      .activity-time {
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      .dashboard {
        padding: 16px 0;
      }

      .container {
        padding: 0 8px;
      }

      .dashboard-title {
        font-size: 24px;
      }

      .action-card {
        flex-direction: column;
        text-align: center;
        gap: 16px;
        padding: 20px;
      }

      .action-arrow {
        display: none;
      }

      .activity-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
      }

      .activity-icon {
        align-self: flex-start;
      }

      .activity-time {
        align-self: flex-end;
        margin-top: 8px;
      }
    }

    @media (max-width: 360px) {
      .actions-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .action-card {
        padding: 16px;
      }

      .action-icon {
        width: 44px;
        height: 44px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private transactionService = inject(TransactionService);

  recentOrders: any[] = [];

  ngOnInit() {
    this.loadRecentOrders();
  }

  currentUser = this.userService.currentUser;
  currentBtcPrice = this.userService.currentBtcPrice;

  recentTransactions() {
    return this.recentOrders;
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }

  goToBuy() {
    this.router.navigate(['/buy']);
  }

  goToSell() {
    this.router.navigate(['/sell']);
  }

  goToMyAds() {
    this.router.navigate(['/my-ads']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getTransactionTitle(transaction: any): string {
    if (transaction.type === 'buy') return 'Compra de Bitcoin';
    if (transaction.type === 'sell') return 'Venda de Bitcoin';
    return 'Transação';
  }

  getTransactionDetails(transaction: any): string {
    const amount = transaction.amount || '0';
    const price = transaction.price || '0';
    return `${amount} BTC por R$ ${this.formatCurrency(parseFloat(price))}`;
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const transactionDate = new Date(date);
    const diffInMs = now.getTime() - transactionDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}d atrás`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h atrás`;
    } else {
      return 'Agora mesmo';
    }
  }

  private loadRecentOrders() {
    // Simular carregamento de pedidos recentes
    this.recentOrders = [
      {
        id: '1',
        type: 'buy',
        amount: '0.025',
        price: '3100.00',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'sell',
        amount: '0.01',
        price: '1250.00',
        status: 'pending',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'buy',
        amount: '0.05',
        price: '6200.00',
        status: 'processing',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
}
