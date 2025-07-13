import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sell-page">
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
            <h1 class="page-title">Vender Bitcoin</h1>
            <p class="page-subtitle">Crie um anúncio para vender seus bitcoins</p>
          </div>
        </div>

        @if (!hasPixAccount) {
          <!-- No PIX Account Warning -->
          <div class="warning-section">
            <div class="warning-card">
              <div class="warning-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="warning-content">
                <h3>Conta PIX não configurada</h3>
                <p>Para vender bitcoins, você precisa configurar uma conta PIX para receber os pagamentos.</p>
                <button class="btn btn-primary" (click)="goToPixAccount()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Configurar Conta PIX
                </button>
              </div>
            </div>
          </div>
        } @else {
          <!-- Sell Form Section -->
          <div class="sell-section">
            <!-- Market Info Card -->
            <div class="market-info-card">
              <div class="market-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="market-content">
                <div class="market-label">Preço Atual do Bitcoin</div>
                <div class="market-value">R$ {{ formatCurrency(currentBtcPrice()) }}</div>
                <div class="market-status">
                  <span class="status-indicator"></span>
                  Atualizado
                </div>
              </div>
            </div>

            <!-- Sell Form -->
            <div class="sell-form-card">
              <div class="form-header">
                <h2>Criar Anúncio de Venda</h2>
                <p>Defina as condições da sua venda</p>
              </div>

              <div class="form-content">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="amountBtc">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Quantidade de Bitcoin
                    </label>
                    <input
                      type="number"
                      id="amountBtc"
                      name="amountBtc"
                      [(ngModel)]="sellOrder.amountBtc"
                      min="0.001"
                      max="10"
                      step="0.001"
                      class="form-input"
                      placeholder="0.00000"
                      (input)="calculateTotal()"
                      required>
                    <div class="input-info">Mínimo: 0.001 BTC</div>
                  </div>

                  <div class="form-group">
                    <label for="pricePerBtc">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                        <path d="M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      Preço por BTC (R$)
                    </label>
                    <input
                      type="number"
                      id="pricePerBtc"
                      name="pricePerBtc"
                      [(ngModel)]="sellOrder.pricePerBtc"
                      min="1"
                      class="form-input"
                      placeholder="280000"
                      (input)="calculateTotal()"
                      required>
                    <div class="input-info suggested">
                      Sugerido: R$ {{ formatCurrency(currentBtcPrice()) }}
                    </div>
                  </div>
                </div>

                @if (sellOrder.amountBtc > 0 && sellOrder.pricePerBtc > 0) {
                  <!-- Calculation Card -->
                  <div class="calculation-card">
                    <h3>Resumo da Venda</h3>
                    <div class="calc-grid">
                      <div class="calc-item">
                        <div class="calc-label">Quantidade</div>
                        <div class="calc-value">{{ sellOrder.amountBtc }} BTC</div>
                      </div>
                      <div class="calc-item">
                        <div class="calc-label">Preço Unitário</div>
                        <div class="calc-value">R$ {{ formatCurrency(sellOrder.pricePerBtc) }}</div>
                      </div>
                      <div class="calc-item total">
                        <div class="calc-label">Total a Receber</div>
                        <div class="calc-value total-value">R$ {{ formatCurrency(sellOrder.totalBrl) }}</div>
                      </div>
                    </div>
                  </div>
                }

                <!-- Form Actions -->
                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="goBack()">
                    Cancelar
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-primary"
                    [disabled]="!sellOrder.amountBtc || !sellOrder.pricePerBtc || loadingService.getIsLoading()()"
                    (click)="confirmSell()">
                    @if (loadingService.getIsLoading()()) {
                      <div class="btn-loading"></div>
                      Processando...
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Criar Anúncio
                    }
                  </button>
                </div>
              </div>
            </div>

            @if (sellConfirmed) {
              <!-- Success Section -->
              <div class="success-section">
                <div class="success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 20V9C3 8.46957 3.21071 7.96086 3.58579 7.58579C3.96086 7.21071 4.46957 7 5 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="success-content">
                  <h3>Anúncio criado com sucesso!</h3>
                  <p>Seu anúncio está ativo e aguardando compradores.</p>
                  
                  <button class="btn btn-primary" (click)="goToDashboard()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Ir para Dashboard
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .sell-page {
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

    /* Warning Section */
    .warning-section {
      display: flex;
      justify-content: center;
      margin-bottom: var(--spacing-2xl);
    }

    .warning-card {
      max-width: 500px;
      width: 100%;
      padding: var(--spacing-2xl);
      background: var(--background-card);
      border: 1px solid var(--warning-yellow);
      border-radius: var(--border-radius-lg);
      text-align: center;
    }

    .warning-icon {
      color: var(--warning-yellow);
      margin-bottom: var(--spacing-lg);
    }

    .warning-content h3 {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .warning-content p {
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-lg) 0;
      line-height: 1.6;
    }

    /* Market Info Card */
    .market-info-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-lg);
    }

    .market-icon {
      color: var(--primary-orange);
    }

    .market-content {
      flex: 1;
    }

    .market-label {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .market-value {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .market-status {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--success-green);
    }

    .status-indicator {
      width: 6px;
      height: 6px;
      background: var(--success-green);
      border-radius: 50%;
    }

    /* Form */
    .sell-form-card {
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-2xl);
      margin-bottom: var(--spacing-xl);
    }

    .form-header {
      text-align: center;
      margin-bottom: var(--spacing-2xl);
    }

    .form-header h2 {
      font-size: var(--font-size-2xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .form-header p {
      color: var(--text-secondary);
      margin: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
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

    .input-info {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      margin-top: var(--spacing-xs);
    }

    .input-info.suggested {
      color: var(--primary-orange);
    }

    /* Calculation Card */
    .calculation-card {
      padding: var(--spacing-lg);
      background: var(--background-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-xl);
    }

    .calculation-card h3 {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
    }

    .calc-grid {
      display: grid;
      gap: var(--spacing-sm);
    }

    .calc-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-color);
    }

    .calc-item:last-child {
      border-bottom: none;
    }

    .calc-item.total {
      padding-top: var(--spacing-md);
      border-top: 2px solid var(--border-color);
      margin-top: var(--spacing-sm);
    }

    .calc-label {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .calc-value {
      color: var(--text-primary);
      font-weight: 500;
    }

    .calc-value.total-value {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--success-green);
    }

    /* Form Actions */
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

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Success Section */
    .success-section {
      display: flex;
      justify-content: center;
    }

    .success-icon {
      color: var(--success-green);
      margin-bottom: var(--spacing-lg);
    }

    .success-content {
      text-align: center;
      max-width: 400px;
      padding: var(--spacing-2xl);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--success-green);
      border-radius: var(--border-radius-lg);
    }

    .success-content h3 {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .success-content p {
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-lg) 0;
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .sell-page {
        padding: var(--spacing-lg) 0;
      }

      .page-header {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .sell-form-card {
        padding: var(--spacing-lg);
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .market-info-card {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class SellComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private transactionService = inject(TransactionService);
  protected loadingService = inject(LoadingService);

  hasPixAccount = true; // Mock value
  currentBtcPrice = this.userService.currentBtcPrice;
  
  sellOrder = {
    amountBtc: 0,
    pricePerBtc: 0,
    totalBrl: 0
  };

  sellConfirmed = false;

  ngOnInit() {
    // Check if user has PIX account
    this.userService.getUserPixAccount().subscribe({
      next: (pixAccount) => {
        this.hasPixAccount = !!pixAccount;
      }
    });
  }

  calculateTotal() {
    this.sellOrder.totalBrl = this.sellOrder.amountBtc * this.sellOrder.pricePerBtc;
  }

  confirmSell() {
    if (!this.sellOrder.amountBtc || !this.sellOrder.pricePerBtc) return;

    this.transactionService.createSellOrder(
      'mock-user-id',
      this.sellOrder.amountBtc,
      this.sellOrder.pricePerBtc
    ).subscribe({
      next: () => {
        this.sellConfirmed = true;
      },
      error: (error: any) => {
        console.error('Erro ao criar anúncio:', error);
        alert('Erro ao criar anúncio. Tente novamente.');
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  goToPixAccount() {
    this.router.navigate(['/pix-account']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
