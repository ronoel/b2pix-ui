import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { LoadingService } from '../../services/loading.service';
import { InvitesService } from '../../shared/api/invites.service';
import { AdvertisementService } from '../../shared/api/advertisement.service';

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
            @if (sellError) {
              <!-- Error Section - Full Screen -->
              <div class="error-section-fullscreen">
                <div class="error-card-fullscreen">
                  <div class="error-icon-large">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                      <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="error-content-fullscreen">
                    <h3>Erro ao criar anúncio</h3>
                    <p>{{ sellErrorMessage }}</p>
                    <div class="error-actions">
                      <button class="btn btn-primary" (click)="retryCreateAdvertisement()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M3.51 15A9 9 0 0 0 21 12A9 9 0 0 0 12.5 3.29L3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Tentar Novamente
                      </button>
                      <button class="btn btn-outline" (click)="goBack()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Voltar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            } @else if (sellConfirmed) {
              <!-- Success Section - Full Screen -->
              <div class="success-section-fullscreen">
                <div class="success-card-fullscreen">
                  <div class="success-icon-large">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 20V9C3 8.46957 3.21071 7.96086 3.58579 7.58579C3.96086 7.21071 4.46957 7 5 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="success-content-fullscreen">
                    <h3>Anúncio criado com sucesso!</h3>
                    <p>Seu anúncio está ativo e aguardando compradores.</p>
                    
                    <div class="success-actions">
                      <button class="btn btn-primary" (click)="goToMyAds()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Ver Meus Anúncios
                      </button>
                      <button class="btn btn-outline" (click)="goToDashboard()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Ir para Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            } @else {
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

                    <!-- Valores Mínimo e Máximo -->
                    <div class="form-group">
                      <label for="minAmount">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Valor Mínimo por Compra (R$)
                      </label>
                      <input
                        type="number"
                        id="minAmount"
                        name="minAmount"
                        [(ngModel)]="sellOrder.minAmountReais"
                        min="1"
                        max="50000"
                        step="1"
                        class="form-input"
                        placeholder="100,00"
                        required>
                      <div class="input-info">
                        Valor mínimo que o comprador pode investir
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="maxAmount">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Valor Máximo por Compra (R$)
                      </label>
                      <input
                        type="number"
                        id="maxAmount"
                        name="maxAmount"
                        [(ngModel)]="sellOrder.maxAmountReais"
                        [min]="sellOrder.minAmountReais"
                        max="100000"
                        step="1"
                        class="form-input"
                        placeholder="2000,00"
                        required>
                      <div class="input-info">
                        Valor máximo que o comprador pode investir
                      </div>
                      @if (sellOrder.maxAmountReais < sellOrder.minAmountReais && sellOrder.maxAmountReais > 0) {
                        <div class="error-message">
                          O valor máximo deve ser maior ou igual ao valor mínimo
                        </div>
                      }
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
                        [value]="getBtcPriceDisplay()"
                        min="1"
                        class="form-input price-input"
                        [placeholder]="formatCurrency(currentBtcPrice())"
                        [readonly]="!isCustomPrice"
                        (input)="onPriceChange($event)"
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

                  @if (isValidSellOrder()) {
                    <!-- Resumo da Venda -->
                    <div class="calculation-card">
                      <h3>Resumo da Venda</h3>
                      <div class="calc-grid">
                        <div class="calc-item">
                          <div class="calc-label">• Quantidade:</div>
                          <div class="calc-value">
                            {{ showInSats ? (getDisplayAmount() | number:'1.0-0') + ' sats' : getDisplayAmount() + ' BTC' }}
                            @if (showInSats) {
                              <span class="btc-equivalent">({{ getDisplayAmount() / 100000000 }} BTC)</span>
                            }
                          </div>
                        </div>
                        <div class="calc-item">
                          <div class="calc-label">• Preço por BTC:</div>
                          <div class="calc-value">R$ {{ formatCurrency(getBtcPriceDisplay()) }}</div>
                        </div>
                        <div class="calc-item">
                          <div class="calc-label">• Compra mínima:</div>
                          <div class="calc-value">R$ {{ formatCurrency(sellOrder.minAmountReais) }}</div>
                        </div>
                        <div class="calc-item">
                          <div class="calc-label">• Compra máxima:</div>
                          <div class="calc-value">R$ {{ formatCurrency(sellOrder.maxAmountReais) }}</div>
                        </div>
                        <div class="calc-item total">
                          <div class="calc-label">• Total a receber:</div>
                          <div class="calc-value total-value">R$ {{ formatCurrency(getTotalDisplay()) }}</div>
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
                      [disabled]="!isValidSellOrder() || loadingService.getIsLoading()()"
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

    .error-message {
      font-size: var(--font-size-xs);
      color: var(--error-color, #ef4444);
      margin-top: var(--spacing-xs);
      padding: var(--spacing-xs);
      background: rgba(239, 68, 68, 0.1);
      border-radius: var(--border-radius);
      border-left: 3px solid var(--error-color, #ef4444);
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

    /* Error Section */
    .error-section {
      margin-bottom: var(--spacing-xl);
    }

    .error-card {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: var(--background-card);
      border: 1px solid var(--error-red);
      border-left: 4px solid var(--error-red);
      border-radius: var(--border-radius-md);
    }

    .error-icon {
      color: var(--error-red);
      flex-shrink: 0;
    }

    .error-content {
      flex: 1;
    }

    .error-content h4 {
      font-size: var(--font-size-md);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .error-content p {
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-md) 0;
      font-size: var(--font-size-sm);
    }

    /* Error Section - Fullscreen */
    .error-section-fullscreen {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      padding: var(--spacing-2xl);
    }

    .error-card-fullscreen {
      max-width: 500px;
      width: 100%;
      padding: var(--spacing-2xl);
      background: var(--background-card);
      border: 1px solid var(--error-red);
      border-left: 4px solid var(--error-red);
      border-radius: var(--border-radius-lg);
      text-align: center;
    }

    .error-icon-large {
      color: var(--error-red);
      margin-bottom: var(--spacing-lg);
    }

    .error-content-fullscreen h3 {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .error-content-fullscreen p {
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-xl) 0;
      line-height: 1.6;
    }

    .error-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;
    }

    .error-actions button {
      min-width: 140px;
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

    .success-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: center;
      flex-wrap: wrap;
    }

    .success-actions button {
      min-width: 160px;
    }

    /* Success Section - Fullscreen */
    .success-section-fullscreen {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      padding: var(--spacing-2xl);
    }

    .success-card-fullscreen {
      max-width: 500px;
      width: 100%;
      padding: var(--spacing-2xl);
      background: var(--background-card);
      border: 1px solid var(--success-green);
      border-left: 4px solid var(--success-green);
      border-radius: var(--border-radius-lg);
      text-align: center;
    }

    .success-icon-large {
      color: var(--success-green);
      margin-bottom: var(--spacing-lg);
    }

    .success-content-fullscreen h3 {
      font-size: var(--font-size-xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .success-content-fullscreen p {
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-xl) 0;
      line-height: 1.6;
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

      .success-actions {
        flex-direction: column;
      }

      .success-actions button {
        min-width: unset;
      }

      .error-card {
        flex-direction: column;
        text-align: center;
      }

      .error-icon {
        align-self: center;
      }

      .error-actions {
        flex-direction: column;
      }

      .error-actions button {
        min-width: unset;
      }

      .error-section-fullscreen {
        min-height: 300px;
        padding: var(--spacing-lg);
      }

      .error-card-fullscreen {
        padding: var(--spacing-lg);
      }

      .success-section-fullscreen {
        min-height: 300px;
        padding: var(--spacing-lg);
      }

      .success-card-fullscreen {
        padding: var(--spacing-lg);
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
  private advertisementService = inject(AdvertisementService);

  hasPixAccount = false; // Changed to false as default, will be updated based on invite status
  currentBtcPrice = this.userService.currentBtcPrice;
  
  sellOrder = {
    amountSats: 0n, // Store as BigInt satoshis
    btcPriceCentsPerBtc: 0, // Store price in cents per Bitcoin (API format) as regular number
    totalSats: 0n,
    minAmountReais: 100, // Minimum purchase amount in reais (pre-filled with R$100,00)
    maxAmountReais: 2000 // Maximum purchase amount in reais (pre-filled with R$2000,00)
  };

  pricingOption = 'market'; // 'immediate', 'fast', 'market', 'custom'
  isCustomPrice = false;
  availableBtcBalance = 0.5; // Mock value - should come from wallet
  sellConfirmed = false;
  sellError = false;
  sellErrorMessage = '';
  
  // Bitcoin/Satoshi unit toggle
  showInSats = true; // Default to sats
  readonly SATS_PER_BTC = 100000000n; // 100 million satoshis per bitcoin as BigInt

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
    if (this.sellOrder.amountSats > 0n && this.sellOrder.btcPriceCentsPerBtc > 0) {
      // Calculate total BRL in cents: amountSats * priceCentsPerBtc / SATS_PER_BTC
      this.sellOrder.totalSats = BigInt(Math.round(Number(this.sellOrder.amountSats) * this.sellOrder.btcPriceCentsPerBtc / Number(this.SATS_PER_BTC)));
    } else {
      this.sellOrder.totalSats = 0n;
    }
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
      // Apply discount to current price and convert to cents per Bitcoin
      const discountMultiplier = (100 - selectedOption.discount) / 100;
      const adjustedPrice = currentPrice * discountMultiplier;
      
      // Convert BRL per BTC to cents per Bitcoin
      // price_reais_per_btc * 100_cents_per_real = price_cents_per_btc
      const priceCentsPerBtc = adjustedPrice * 100;
      this.sellOrder.btcPriceCentsPerBtc = priceCentsPerBtc; // Store actual cents per Bitcoin value
    }
  }

  setMaxAmount() {
    this.sellOrder.amountSats = BigInt(Math.floor(this.availableBtcBalance * Number(this.SATS_PER_BTC)));
    this.calculateTotal();
  }

  toggleUnit() {
    this.showInSats = !this.showInSats;
  }

  getDisplayAmount(): number {
    return this.showInSats ? Number(this.sellOrder.amountSats) : Number(this.sellOrder.amountSats) / Number(this.SATS_PER_BTC);
  }

  setDisplayAmount(value: number) {
    if (this.showInSats) {
      this.sellOrder.amountSats = BigInt(Math.floor(value));
    } else {
      this.sellOrder.amountSats = BigInt(Math.floor(value * Number(this.SATS_PER_BTC)));
    }
  }

  getDisplayBalance(): number {
    return this.showInSats ? this.availableBtcBalance * Number(this.SATS_PER_BTC) : this.availableBtcBalance;
  }

  getMinAmount(): number {
    return this.showInSats ? 0.001 * Number(this.SATS_PER_BTC) : 0.001;
  }

  getStepAmount(): number {
    return this.showInSats ? 1 : 0.001;
  }

  onAmountChange(event: any) {
    const value = parseFloat(event.target.value) || 0;
    this.setDisplayAmount(value);
    this.calculateTotal();
  }

  getBtcPriceDisplay(): number {
    // Convert cents per Bitcoin back to BRL per Bitcoin for display
    // price_cents_per_btc / 100_cents_per_real = price_reais_per_btc
    return this.sellOrder.btcPriceCentsPerBtc / 100;
  }

  onPriceChange(event: any) {
    const value = parseFloat(event.target.value) || 0;
    // Convert BRL per BTC to cents per Bitcoin
    // price_reais_per_btc * 100_cents_per_real = price_cents_per_btc
    const priceCentsPerBtc = value * 100;
    this.sellOrder.btcPriceCentsPerBtc = priceCentsPerBtc; // Store actual cents per Bitcoin value
    this.calculateTotal();
  }

  isValidSellOrder(): boolean {
    return this.sellOrder.amountSats > 0n && 
           this.sellOrder.btcPriceCentsPerBtc > 0 &&
           this.isValidAmountRange();
  }

  isValidAmountRange(): boolean {
    return this.sellOrder.minAmountReais > 0 && 
           this.sellOrder.maxAmountReais > 0 &&
           this.sellOrder.maxAmountReais >= this.sellOrder.minAmountReais;
  }

  getTotalDisplay(): number {
    // totalSats contains total amount in cents, convert to reais
    return Number(this.sellOrder.totalSats) / 100;
  }

  confirmSell() {
    if (!this.sellOrder.amountSats || !this.sellOrder.btcPriceCentsPerBtc) return;

    // Reset error state
    this.sellError = false;
    this.sellErrorMessage = '';

    // Set loading state
    this.loadingService.show('Criando anúncio...');

    // Amount is already in satoshis
    const amountInSats = this.sellOrder.amountSats;
    
    // Debug logging to check price conversion
    const priceForAPI = BigInt(Math.round(this.sellOrder.btcPriceCentsPerBtc));
    console.log('Price Conversion Debug:');
    console.log('- Display price (BRL per BTC):', this.getBtcPriceDisplay());
    console.log('- Internal price (cents per BTC):', this.sellOrder.btcPriceCentsPerBtc);
    console.log('- Price for API (cents per BTC):', priceForAPI.toString());
    
    this.advertisementService.createAdvertisement({
      amountInSats,
      price: priceForAPI,  // Price in cents per Bitcoin
      minAmount: this.sellOrder.minAmountReais * 100, // Convert reais to cents
      maxAmount: this.sellOrder.maxAmountReais * 100  // Convert reais to cents
    }).subscribe({
      next: (advertisement) => {
        console.log('Advertisement created successfully:', advertisement);
        this.loadingService.hide();
        this.sellConfirmed = true;
      },
      error: (error) => {
        console.error('Error creating advertisement:', error);
        this.loadingService.hide();
        this.sellError = true;
        this.sellErrorMessage = this.getErrorMessage(error);
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Ocorreu um erro inesperado ao criar o anúncio. Tente novamente.';
  }

  retryCreateAdvertisement() {
    this.sellError = false;
    this.sellErrorMessage = '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  goToPixAccount() {
    this.router.navigate(['/pix-account']);
  }

  goToMyAds() {
    this.router.navigate(['/my-ads']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
