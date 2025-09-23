import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../services/loading.service';
import { BuyService } from '../../shared/api/buy.service';
import { Buy } from '../../shared/models/buy.model';

@Component({
  selector: 'app-buy-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="buy-payment-page">
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
            <h1 class="page-title">Pagamento via Pix</h1>
            <p class="page-subtitle">Efetue o pagamento via PIX</p>
          </div>
        </div>

        @if (isLoading()) {
          <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Carregando dados da compra...</p>
          </div>
        } @else if (errorMessage()) {
          <div class="error-state">
            <div class="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Erro ao carregar compra</h3>
            <p>{{ errorMessage() }}</p>
            <button class="btn btn-primary" (click)="loadBuyData()">Tentar novamente</button>
          </div>
        } @else if (buyData()) {
          <div class="payment-container">
            <div class="payment-card">
              <div class="payment-header">
                <div class="timer-section">
                  <div class="timer-icon">⏱️</div>
                  <div class="timer-content">
                    <p>Tempo restante para concluir pagamento:</p>
                    <div class="timer-display">{{ getFormattedTime() }}</div>
                  </div>
                </div>
              </div>

              <div class="payment-info">
                <div class="amount-section">
                  <p>Valor exato a pagar:</p>
                  <div class="payment-amount">R$ {{ formatCurrency(getTotalFiatAmount()) }}</div>
                </div>

                <div class="pix-section">
                  <label>Chave Pix:</label>
                  <div class="pix-key-container">
                    <input type="text" readonly [value]="buyData()!.pix_key" class="pix-key-input">
                    <button type="button" class="btn btn-outline btn-sm" (click)="copyPixKey()">
                      📋 Copiar chave
                    </button>
                  </div>
                </div>
              </div>

              <div class="transaction-id-section">
                <div class="form-group">
                  <label for="transactionId">Digite os 3 últimos caracteres do ID da transação</label>
                  <input
                    type="text"
                    id="transactionId"
                    maxlength="3"
                    [value]="transactionId()"
                    (input)="onTransactionIdChange($any($event.target).value)"
                    [disabled]="noTransactionId()"
                    class="form-input transaction-input"
                    [class.disabled]="noTransactionId()"
                    placeholder="Ex: 7A9"
                    autocomplete="off"
                  >
                  <div class="input-help">
                    <span class="help-icon">ℹ️</span>
                    O ID aparece no comprovante Pix. Informe apenas os 3 últimos caracteres (letras e/ou números) para validar seu pagamento.
                  </div>
                  @if (transactionId().length > 0 && !canConfirmPayment() && !noTransactionId()) {
                    <div class="error-message">
                      Informe exatamente 3 caracteres, que podem ser letras e/ou números.
                    </div>
                  }
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      [checked]="noTransactionId()"
                      (change)="onNoTransactionIdChange($any($event.target).checked)"
                    >
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">Não encontrei o ID da transação</span>
                  </label>
                  <div class="input-help" style="margin-top: var(--spacing-xs); margin-left: 28px;">
                    <span class="help-icon">⚠️</span>
                    Marque esta opção apenas se não conseguir localizar o ID no comprovante Pix. Isso pode atrasar a validação do seu pagamento.
                  </div>
                </div>
              </div>

              <div class="step-actions">
                <button type="button" class="btn btn-outline btn-danger" (click)="cancelPurchase()">
                  ❌ Cancelar compra
                </button>
                <button 
                  type="button" 
                  class="btn btn-primary btn-success"
                  [disabled]="!canConfirmPayment()"
                  (click)="confirmPayment($event)"
                >
                  ✅ Confirmar Pagamento
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .buy-payment-page {
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

    /* Error State */
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-2xl);
      text-align: center;
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      border-left: 4px solid var(--error-red);
    }

    .error-icon {
      color: var(--error-red);
    }

    .error-state h3 {
      font-size: var(--font-size-lg);
      color: var(--text-primary);
      margin: 0;
    }

    .error-state p {
      color: var(--text-secondary);
      margin: 0;
    }

    /* Payment Container */
    .payment-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .payment-card {
      padding: var(--spacing-xl);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      border-left: 4px solid var(--success-green);
    }

    .payment-header {
      margin-bottom: var(--spacing-xl);
    }

    .timer-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: rgba(255, 193, 7, 0.1);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--warning-yellow);
    }

    .timer-icon {
      font-size: 24px;
    }

    .timer-content p {
      margin: 0 0 var(--spacing-xs) 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .timer-display {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--warning-yellow);
      font-family: monospace;
    }

    .payment-info {
      margin-bottom: var(--spacing-xl);
    }

    .amount-section {
      margin-bottom: var(--spacing-lg);
      text-align: center;
    }

    .amount-section p {
      margin: 0 0 var(--spacing-xs) 0;
      color: var(--text-secondary);
    }

    .payment-amount {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--primary-orange);
    }

    .pix-section label {
      display: block;
      margin-bottom: var(--spacing-xs);
      color: var(--text-primary);
      font-weight: 500;
    }

    .pix-key-container {
      display: flex;
      gap: var(--spacing-sm);
      align-items: center;
    }

    .pix-key-input {
      flex: 1;
      padding: var(--spacing-md);
      background: var(--background-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      color: var(--text-primary);
      font-family: monospace;
    }

    .transaction-id-section {
      margin-bottom: var(--spacing-xl);
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

    .transaction-input {
      text-transform: uppercase;
      font-family: monospace;
      font-weight: 700;
      text-align: center;
      font-size: var(--font-size-lg);
    }

    .transaction-input.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--background-card);
    }

    .form-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--background-card);
    }

    .input-help {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      line-height: 1.4;
    }

    .help-icon {
      flex-shrink: 0;
    }

    .error-message {
      color: var(--error-red);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      cursor: pointer;
      font-size: var(--font-size-md, 16px);
      color: var(--text-primary, #FFFFFF);
      user-select: none;
      width: 100%;
      line-height: 1.5;
    }

    .checkbox-label input[type="checkbox"] {
      display: none;
      visibility: hidden;
      opacity: 0;
      position: absolute;
      left: -9999px;
    }

    .checkbox-custom {
      width: 20px;
      height: 20px;
      min-width: 20px;
      min-height: 20px;
      border: 2px solid var(--border-color, #333333);
      border-radius: var(--border-radius-sm, 8px);
      background: var(--background-elevated, #2A2A2A);
      position: relative;
      transition: all var(--transition-normal, 0.2s ease);
      flex-shrink: 0;
      display: inline-block;
      box-sizing: border-box;
    }

    .checkbox-custom:hover {
      border-color: var(--primary-orange, #F7931A);
    }

    .checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
      background: var(--primary-orange, #F7931A);
      border-color: var(--primary-orange, #F7931A);
    }

    .checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
      font-weight: bold;
      line-height: 1;
      display: block;
    }

    .checkbox-text {
      flex: 1;
      line-height: 1.5;
    }

    .step-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      margin-top: var(--spacing-xl);
    }

    .btn-success {
      background: var(--success-green);
      border-color: var(--success-green);
    }

    .btn-success:hover:not(:disabled) {
      background: var(--success-green);
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-danger {
      background: var(--error-red);
      border-color: var(--error-red);
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: var(--error-red);
      opacity: 0.9;
      transform: translateY(-1px);
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .buy-payment-page {
        padding: var(--spacing-lg) 0;
      }

      .page-header {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .step-actions {
        flex-direction: column;
      }

      .pix-key-container {
        flex-direction: column;
      }
    }
  `]
})
export class BuyPaymentComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private loadingService = inject(LoadingService);
  private buyService = inject(BuyService);

  // Component state
  buyData = signal<Buy | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  
  // Payment form state
  transactionId = signal('');
  noTransactionId = signal(false);
  
  // Timer for payment
  paymentTimeLeft = signal(0);
  private paymentTimer: any;

  ngOnInit() {
    // Get buy ID from route parameters
    const buyId = this.route.snapshot.paramMap.get('id');
    
    if (buyId) {
      this.loadBuyData(buyId);
    } else {
      this.errorMessage.set('ID da compra não encontrado na URL');
      this.isLoading.set(false);
    }
  }

  ngOnDestroy() {
    this.clearPaymentTimer();
  }

  loadBuyData(buyId?: string) {
    const id = buyId || this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.errorMessage.set('ID da compra não encontrado');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.buyService.getBuyById(id).subscribe({
      next: (buy) => {
        this.buyData.set(buy);
        this.startPaymentTimer(buy);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar dados da compra:', error);
        this.errorMessage.set('Não foi possível carregar os dados da compra. Verifique se o ID está correto.');
        this.isLoading.set(false);
      }
    });
  }

  startPaymentTimer(buy: Buy) {
    if (!buy.expires_at) {
      return;
    }

    this.updatePaymentTimeLeft(buy);
    
    this.paymentTimer = setInterval(() => {
      this.updatePaymentTimeLeft(buy);
    }, 1000);
  }

  private updatePaymentTimeLeft(buy: Buy) {
    const now = new Date();
    const expiresAt = new Date(buy.expires_at);
    const timeLeftMs = expiresAt.getTime() - now.getTime();
    const timeLeftSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));
    
    this.paymentTimeLeft.set(timeLeftSeconds);
    
    if (timeLeftSeconds <= 0) {
      this.clearPaymentTimer();
      this.handlePaymentTimeout();
    }
  }

  clearPaymentTimer() {
    if (this.paymentTimer) {
      clearInterval(this.paymentTimer);
      this.paymentTimer = null;
    }
  }

  handlePaymentTimeout() {
    alert('O tempo de pagamento foi excedido. Sua compra foi cancelada.');
    this.router.navigate(['/buy']);
  }

  getFormattedTime(): string {
    const time = this.paymentTimeLeft();
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getTotalFiatAmount(): number {
    const buy = this.buyData();
    if (!buy) return 0;
    
    // Convert from cents to reais using pay_value
    return Number(buy.pay_value) / 100;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  onTransactionIdChange(transactionId: string) {
    this.transactionId.set(transactionId.toUpperCase());
    if (transactionId.length > 0) {
      this.noTransactionId.set(false);
    }
  }

  onNoTransactionIdChange(noTransactionId: boolean) {
    this.noTransactionId.set(noTransactionId);
    if (noTransactionId) {
      this.transactionId.set('');
    }
  }

  canConfirmPayment(): boolean {
    if (this.noTransactionId()) {
      return true;
    }
    const txId = this.transactionId();
    return txId.length === 3 && /^[A-Z0-9]{3}$/.test(txId);
  }

  copyPixKey() {
    const buy = this.buyData();
    if (buy?.pix_key) {
      navigator.clipboard.writeText(buy.pix_key).then(() => {
        alert('Chave PIX copiada para a área de transferência!');
      }).catch(() => {
        alert('Erro ao copiar chave PIX. Copie manualmente.');
      });
    }
  }

  confirmPayment(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('confirmPayment called');
    console.log('canConfirmPayment:', this.canConfirmPayment());
    
    if (!this.canConfirmPayment()) {
      console.log('Cannot confirm payment - validation failed');
      return;
    }
    
    const buy = this.buyData();
    console.log('Buy data:', buy);
    
    if (!buy) {
      console.log('No buy data available');
      return;
    }
    
    console.log('Starting payment confirmation...');
    this.loadingService.show();
    
    // Get the pix ID (transaction ID) or pass undefined if "no transaction ID" is checked
    const pixId = this.noTransactionId() ? undefined : this.transactionId();
    console.log('Pix ID:', pixId, 'No transaction ID:', this.noTransactionId());
    
    this.buyService.markBuyAsPaid(buy.id, pixId).subscribe({
      next: (updatedBuy) => {
        console.log('Payment confirmed successfully:', updatedBuy);
        this.loadingService.hide();
        this.buyData.set(updatedBuy);
        
        // Show success message
        alert('Pagamento confirmado com sucesso! Aguarde a liberação dos bitcoins.');
        
        // Navigate back to dashboard or buy page
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error confirming payment:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);
        this.loadingService.hide();
        
        let errorMessage = 'Erro ao confirmar pagamento. Tente novamente.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
      }
    });
  }

  cancelPurchase() {
    // TODO: Implement buy cancellation logic
    this.clearPaymentTimer();
    this.router.navigate(['/buy']);
  }

  goBack() {
    this.router.navigate(['/buy']);
  }
}