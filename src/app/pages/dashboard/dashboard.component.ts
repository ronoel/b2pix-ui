import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <div class="container">
        <!-- Header -->
        <div class="dashboard-header">
          <div class="header-left">
            <h1 class="dashboard-title">Dashboard</h1>
            <p class="dashboard-subtitle">Bem-vindo de volta, {{ currentUser()?.username }}!</p>
          </div>
          <div class="header-right">
            <div class="wallet-info">
              <div class="status-badge approved">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Acesso liberado
              </div>
              <button class="btn btn-outline btn-sm" (click)="logout()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Sair
              </button>
            </div>
          </div>
        </div>

        <!-- Balance Cards -->
        <div class="balance-section">
          <div class="balance-grid">
            <div class="balance-card primary">
              <div class="balance-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="balance-info">
                <div class="balance-label">Preço BTC Atual</div>
                <div class="balance-value">R$ {{ formatCurrency(currentBtcPrice()) }}</div>
                <div class="balance-fiat">Atualizado agora</div>
              </div>
            </div>

            <div class="balance-card secondary">
              <div class="balance-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="balance-info">
                <div class="balance-label">Transações</div>
                <div class="balance-value">{{ recentTransactions().length }}</div>
                <div class="balance-fiat">Total realizadas</div>
              </div>
            </div>

            <div class="balance-card tertiary">
              <div class="balance-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="balance-info">
                <div class="balance-label">Conta PIX</div>
                <div class="balance-value">{{ hasPixAccount ? 'Ativa' : 'Pendente' }}</div>
                <div class="balance-fiat">{{ hasPixAccount ? 'Configurada' : 'Necessária' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <h2 class="section-title">Ações Rápidas</h2>
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

            <div class="action-card" (click)="goToPixAccount()">
              <div class="action-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 9H15V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="action-content">
                <h3 class="action-title">Conta PIX</h3>
                <p class="action-description">{{ hasPixAccount ? 'Gerenciar conta' : 'Cadastrar conta' }}</p>
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
    .dashboard {
      min-height: 100vh;
      background: var(--background-dark);
      padding: var(--spacing-xl) 0;
    }

    /* Header */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-2xl);
      padding-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
    }

    .dashboard-title {
      font-size: var(--font-size-3xl);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .dashboard-subtitle {
      font-size: var(--font-size-md);
      color: var(--text-secondary);
      margin: 0;
    }

    .wallet-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--success-green);
      color: white;
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      font-weight: 500;
    }

    .btn-sm {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-sm);
    }

    /* Balance Section */
    .balance-section {
      margin-bottom: var(--spacing-2xl);
    }

    .balance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .balance-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
      transition: all var(--transition-normal);
    }

    .balance-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .balance-card.primary {
      border-left: 4px solid var(--primary-orange);
    }

    .balance-card.secondary {
      border-left: 4px solid var(--primary-blue);
    }

    .balance-card.tertiary {
      border-left: 4px solid var(--success-green);
    }

    .balance-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      border-radius: var(--border-radius-lg);
      background: var(--background-elevated);
      color: var(--primary-orange);
    }

    .balance-card.secondary .balance-icon {
      color: var(--primary-blue);
    }

    .balance-card.tertiary .balance-icon {
      color: var(--success-green);
    }

    .balance-info {
      flex: 1;
    }

    .balance-label {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
      margin-bottom: var(--spacing-xs);
    }

    .balance-value {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .balance-fiat {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }

    /* Actions Section */
    .actions-section {
      margin-bottom: var(--spacing-2xl);
    }

    .section-title {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-lg);
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--spacing-lg);
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      cursor: pointer;
      transition: all var(--transition-normal);
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-orange);
    }

    .action-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--border-radius-md);
      background: var(--background-elevated);
      color: var(--primary-orange);
    }

    .action-content {
      flex: 1;
    }

    .action-title {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .action-description {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin: 0;
    }

    .action-arrow {
      color: var(--text-muted);
      transition: all var(--transition-normal);
    }

    .action-card:hover .action-arrow {
      color: var(--primary-orange);
      transform: translateX(4px);
    }

    /* Activity Section */
    .activity-section {
      margin-bottom: var(--spacing-2xl);
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      transition: all var(--transition-normal);
    }

    .activity-item:hover {
      background: var(--background-elevated);
    }

    .activity-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius-sm);
      color: white;
    }

    .activity-icon.success {
      background: var(--success-green);
    }

    .activity-icon.info {
      background: var(--primary-blue);
    }

    .activity-icon.warning {
      background: var(--warning-yellow);
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-size: var(--font-size-md);
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .activity-details {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }

    .activity-time {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      white-space: nowrap;
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .dashboard {
        padding: var(--spacing-lg) 0;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-lg);
      }

      .wallet-info {
        width: 100%;
        justify-content: space-between;
      }

      .balance-grid {
        grid-template-columns: 1fr;
      }

      .balance-card {
        padding: var(--spacing-lg);
      }

      .balance-icon {
        width: 48px;
        height: 48px;
      }

      .balance-value {
        font-size: var(--font-size-xl);
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }

      .action-card {
        padding: var(--spacing-lg);
      }

      .action-icon {
        width: 40px;
        height: 40px;
      }

      .activity-item {
        padding: var(--spacing-md);
      }

      .activity-icon {
        width: 28px;
        height: 28px;
      }
    }

    @media (max-width: 480px) {
      .wallet-info {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-sm);
      }

      .balance-card {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-md);
      }

      .action-card {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-md);
      }

      .action-arrow {
        display: none;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private transactionService = inject(TransactionService);

  recentOrders: any[] = [];
  hasPixAccount = false;

  ngOnInit() {
    this.checkPixAccount();
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

  goToPixAccount() {
    this.router.navigate(['/pix-account']);
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

  private checkPixAccount() {
    // Simular verificação de conta PIX
    this.hasPixAccount = Math.random() > 0.5;
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
