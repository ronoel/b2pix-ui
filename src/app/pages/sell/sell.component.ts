import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { LoadingService } from '../../services/loading.service';
import { InvitesService } from '../../shared/api/invites.service';
import { BoltContractSBTCService } from '../../libs/bolt-contract-sbtc.service';
import { deserializeTransaction } from '@stacks/transactions';
import { environment } from '../../../environments/environment';
import { B2PIXService } from '../../libs/b2pix.service';

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
                  <!-- Quantidade de BTC -->
                  <div class="form-group full-width">
                    <div class="label-with-toggle">
                      <label for="amountBtc">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Quantidade de {{ showInSats ? 'Satoshis' : 'Bitcoin' }} a vender:
                      </label>
                      <button 
                        type="button" 
                        class="unit-toggle-btn"
                        (click)="toggleUnit()"
                        title="Alternar entre BTC e Satoshis">
                        {{ showInSats ? 'sats' : 'BTC' }}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <div class="input-with-button">
                      <input
                        type="number"
                        id="amountBtc"
                        name="amountBtc"
                        [value]="getDisplayAmount()"
                        [min]="getMinAmount()"
                        max="10"
                        [step]="getStepAmount()"
                        class="form-input"
                        [placeholder]="showInSats ? '100000' : '0.00100'"
                        (input)="onAmountChange($event)"
                        required>
                      <button 
                        type="button" 
                        class="btn btn-outline btn-sm max-btn"
                        [disabled]="availableBtcBalance === 0"
                        (click)="setMaxAmount()">
                        Máximo
                      </button>
                    </div>
                    <div class="input-info">
                      Saldo disponível: {{ showInSats ? (getDisplayBalance() | number:'1.0-0') + ' sats' : availableBtcBalance + ' BTC' }} • 
                      Mínimo: {{ showInSats ? (getMinAmount() | number:'1.0-0') + ' sats' : getMinAmount() + ' BTC' }}
                    </div>
                  </div>

                  <!-- Preço por BTC -->
                  <div class="form-group full-width">
                    <label for="pricingOption">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                        <path d="M17 5H9.5C8.11929 5 7 6.11929 7 7.5S8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5S15.8807 15 14.5 15H7" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      Preço por BTC (R$)
                    </label>
                    
                    <!-- Dropdown de opções de preço -->
                    <select 
                      id="pricingOption"
                      name="pricingOption"
                      [(ngModel)]="pricingOption"
                      (change)="onPricingOptionChange()"
                      class="form-select">
                      @for (option of pricingOptions; track option.value) {
                        <option [value]="option.value">{{ option.label }}</option>
                      }
                    </select>
                    
                    <!-- Campo de valor do preço -->
                    <input
                      type="number"
                      id="btcPrice"
                      name="btcPrice"
                      [(ngModel)]="sellOrder.btcPrice"
                      min="1"
                      class="form-input price-input"
                      [placeholder]="formatCurrency(currentBtcPrice())"
                      [readonly]="!isCustomPrice"
                      (input)="calculateTotal()"
                      required>
                    <div class="input-info">
                      @if (!isCustomPrice) {
                        <span class="auto-calculated">Valor calculado automaticamente</span>
                      } @else {
                        <span>Digite o preço desejado por BTC</span>
                      }
                    </div>
                  </div>
                </div>

                @if (sellOrder.amountBtc > 0 && sellOrder.btcPrice > 0) {
                  <!-- Resumo da Venda -->
                  <div class="calculation-card">
                    <h3>Resumo da Venda</h3>
                    <div class="calc-grid">
                      <div class="calc-item">
                        <div class="calc-label">• Quantidade:</div>
                        <div class="calc-value">
                          {{ showInSats ? (getDisplayAmount() | number:'1.0-0') + ' sats' : sellOrder.amountBtc + ' BTC' }}
                          @if (showInSats) {
                            <span class="btc-equivalent">({{ sellOrder.amountBtc }} BTC)</span>
                          }
                        </div>
                      </div>
                      <div class="calc-item">
                        <div class="calc-label">• Preço por BTC:</div>
                        <div class="calc-value">R$ {{ formatCurrency(sellOrder.btcPrice) }}</div>
                      </div>
                      <div class="calc-item total">
                        <div class="calc-label">• Total a receber:</div>
                        <div class="calc-value total-value">R$ {{ formatCurrency(sellOrder.totalBrl) }}</div>
                      </div>
                    </div>
                  </div>
                }

                <!-- Form Actions -->
                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="goBack()">
                    ❌ Cancelar
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-primary"
                    [disabled]="!sellOrder.amountBtc || !sellOrder.btcPrice || loadingService.getIsLoading()()"
                    (click)="confirmSell()">
                    @if (loadingService.getIsLoading()()) {
                      <div class="btn-loading"></div>
                      Processando...
                    } @else {
                      ✅ Criar Anúncio
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
      gap: var(--spacing-xl);
      margin-bottom: var(--spacing-xl);
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .label-with-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xs);
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--text-primary);
      margin: 0;
    }

    .unit-toggle-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--background-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      color: var(--text-secondary);
      font-size: var(--font-size-xs);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-normal);
    }

    .unit-toggle-btn:hover {
      background: var(--primary-orange);
      color: white;
      border-color: var(--primary-orange);
    }

    .unit-toggle-btn svg {
      transition: transform var(--transition-normal);
    }

    .unit-toggle-btn:hover svg {
      transform: translateY(1px);
    }

    .input-with-button {
      display: flex;
      gap: var(--spacing-sm);
      align-items: center;
    }

    .input-with-button .form-input {
      flex: 1;
    }

    .max-btn {
      white-space: nowrap;
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-sm);
    }

    .max-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .form-input, .form-select {
      width: 100%;
      padding: var(--spacing-md);
      background: var(--background-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      color: var(--text-primary);
      font-size: var(--font-size-md);
      transition: border-color var(--transition-normal);
    }

    .form-input:focus, .form-select:focus {
      border-color: var(--primary-orange);
      outline: none;
    }

    .form-select {
      margin-bottom: var(--spacing-sm);
    }

    .price-input[readonly] {
      background: var(--background-card);
      cursor: not-allowed;
    }

    .input-info {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      margin-top: var(--spacing-xs);
    }

    .input-info.suggested {
      color: var(--primary-orange);
    }

    .auto-calculated {
      color: var(--success-green);
      font-weight: 500;
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

    .btc-equivalent {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      font-weight: 400;
      margin-left: var(--spacing-xs);
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
        gap: var(--spacing-lg);
      }

      .form-actions {
        flex-direction: column;
        gap: var(--spacing-sm);
      }

      .form-actions button {
        min-height: 48px; /* Touch-friendly size */
      }

      .market-info-card {
        flex-direction: column;
        text-align: center;
      }

      .input-with-button {
        flex-direction: column;
        align-items: stretch;
      }

      .input-with-button .form-input {
        margin-bottom: var(--spacing-sm);
      }

      .label-with-toggle {
        flex-wrap: wrap;
        gap: var(--spacing-sm);
      }

      .unit-toggle-btn {
        order: 2;
        flex-shrink: 0;
      }

      .max-btn {
        align-self: stretch;
        justify-content: center;
      }

      /* Ensure calculation card is always visible on mobile */
      .calculation-card {
        position: sticky;
        bottom: var(--spacing-md);
        z-index: 10;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
      }
    }

    @media (max-width: 480px) {
      .input-with-button {
        gap: var(--spacing-xs);
      }
      
      .form-actions {
        position: sticky;
        bottom: 0;
        background: var(--background-card);
        padding: var(--spacing-md);
        margin: 0 calc(-1 * var(--spacing-lg));
        border-top: 1px solid var(--border-color);
      }
    }
  `]
})
export class SellComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private transactionService = inject(TransactionService);
  protected loadingService = inject(LoadingService);
  private invitesService = inject(InvitesService);
  private boltContractSBTCService = inject(BoltContractSBTCService);
  private b2PIXService = inject(B2PIXService);

  hasPixAccount = false; // Changed to false as default, will be updated based on invite status
  currentBtcPrice = this.userService.currentBtcPrice;
  
  sellOrder = {
    amountBtc: 0,
    btcPrice: 0,
    totalBrl: 0
  };

  pricingOption = 'market'; // 'immediate', 'fast', 'market', 'custom'
  isCustomPrice = false;
  availableBtcBalance = 0.5; // Mock value - should come from wallet
  sellConfirmed = false;
  
  // Bitcoin/Satoshi unit toggle
  showInSats = false;
  readonly SATS_PER_BTC = 100000000; // 100 million satoshis per bitcoin

  pricingOptions = [
    { value: 'immediate', label: 'Venda imediata', discount: 1.0 },
    { value: 'fast', label: 'Venda rápida', discount: 0.5 },
    { value: 'market', label: 'Valor de mercado', discount: 0 },
    { value: 'custom', label: 'Editar', discount: 0 }
  ];

  ngOnInit() {
    // Check if user has PIX account by checking invite bank status
    this.invitesService.getWalletInvite().subscribe({
      next: (invite) => {
        // Only show sell form if bank status is "success"
        this.hasPixAccount = invite?.bank_status === 'success';
      },
      error: (error) => {
        console.error('Error checking invite status:', error);
        // On error, assume no PIX account
        this.hasPixAccount = false;
      }
    });
    
    // Initialize with market price
    this.updatePriceFromOption();
  }

  calculateTotal() {
    this.sellOrder.totalBrl = this.sellOrder.amountBtc * this.sellOrder.btcPrice;
  }

  onPricingOptionChange() {
    this.isCustomPrice = this.pricingOption === 'custom';
    if (!this.isCustomPrice) {
      this.updatePriceFromOption();
    }
    this.calculateTotal();
  }

  updatePriceFromOption() {
    const currentPrice = this.currentBtcPrice();
    const selectedOption = this.pricingOptions.find(opt => opt.value === this.pricingOption);
    
    if (selectedOption) {
      // Apply discount to current price
      const discountMultiplier = (100 - selectedOption.discount) / 100;
      this.sellOrder.btcPrice = currentPrice * discountMultiplier;
    }
  }

  setMaxAmount() {
    this.sellOrder.amountBtc = this.availableBtcBalance;
    this.calculateTotal();
  }

  toggleUnit() {
    this.showInSats = !this.showInSats;
  }

  getDisplayAmount(): number {
    return this.showInSats ? this.sellOrder.amountBtc * this.SATS_PER_BTC : this.sellOrder.amountBtc;
  }

  setDisplayAmount(value: number) {
    this.sellOrder.amountBtc = this.showInSats ? value / this.SATS_PER_BTC : value;
  }

  getDisplayBalance(): number {
    return this.showInSats ? this.availableBtcBalance * this.SATS_PER_BTC : this.availableBtcBalance;
  }

  getMinAmount(): number {
    return this.showInSats ? 0.001 * this.SATS_PER_BTC : 0.001;
  }

  getStepAmount(): number {
    return this.showInSats ? 1 : 0.001;
  }

  onAmountChange(event: any) {
    const value = parseFloat(event.target.value) || 0;
    this.setDisplayAmount(value);
    this.calculateTotal();
  }

  confirmSell() {
    if (!this.sellOrder.amountBtc || !this.sellOrder.btcPrice) return;

    // Convert BTC amount to satoshis for the transfer
    const amountInSats = Math.floor(this.sellOrder.amountBtc * this.SATS_PER_BTC);
    const recipient = environment.b2pixAddress;

    // First call the Bolt contract transfer
    this.boltContractSBTCService.transferStacksToBolt(amountInSats, recipient, this.sellOrder.btcPrice.toString()).subscribe({
      next: (transactionSerialized) => {
        console.log('Transfer successful:', transactionSerialized);

        this.b2PIXService.sendTransaction(transactionSerialized).subscribe({
          next: (txid: string) => {
            console.log('Transaction sent successfully:', txid);
            // this.sellConfirmed = true;
            // this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            console.error('Error sending transaction:', err);
          }
        });
      },
      error: (transferError: any) => {
        console.error('Erro na transferência:', transferError);
        alert('Erro na transferência. Tente novamente.');
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
