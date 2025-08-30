import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { LoadingService } from '../../services/loading.service';
import { AdvertisementService } from '../../shared/api/advertisement.service';
import { BuyService } from '../../shared/api/buy.service';
import { Advertisement, AdvertisementStatus } from '../../shared/models/advertisement.model';
import { BitcoinListing, PurchaseOrder } from '../../interfaces/transaction.interface';

@Component({
  selector: 'app-buy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="buy-page">
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
            <h1 class="page-title">
              @if (currentStep() === 'listings') { Comprar Bitcoin }
              @else if (currentStep() === 'step1') { Comprar Bitcoin }
              @else if (currentStep() === 'step2') { Antes de prosseguir }
              @else { Pagamento via Pix }
            </h1>
            <p class="page-subtitle">
              @if (currentStep() === 'listings') { Encontre as melhores ofertas do mercado }
              @else if (currentStep() === 'step1') { Informe o valor que deseja comprar }
              @else if (currentStep() === 'step2') { Informações importantes sobre o processo }
              @else { Efetue o pagamento via PIX }
            </p>
          </div>
        </div>

        @if (currentStep() === 'listings') {
          <!-- Price Info Card -->
          <div class="price-info-card">
            <div class="price-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="price-content">
              <div class="price-label">Preço de Referência BTC</div>
              <div class="price-value">R$ {{ formatCurrency(userService.currentBtcPrice()) }}</div>
            </div>
          </div>

          <!-- Listings Section -->
          <div class="listings-section">
            <div class="section-header">
              <h2 class="section-title">Anúncios Disponíveis</h2>
              <button class="btn btn-outline btn-sm refresh-btn" (click)="loadListings()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12C3 7.02944 7.02944 3 12 3C14.5755 3 16.9 4.15205 18.5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C9.42446 21 7.09995 19.848 5.5 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13 2L18 6L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M11 22L6 18L10 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Atualizar
              </button>
            </div>
            
            @if (isLoadingListings()) {
              <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Carregando anúncios...</p>
              </div>
            } @else if (listings().length === 0) {
              <div class="empty-state">
                <div class="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h3>Nenhum anúncio disponível</h3>
                <p>Não há ofertas de Bitcoin no momento. Tente novamente mais tarde.</p>
                <button class="btn btn-primary" (click)="loadListings()">Recarregar</button>
              </div>
            } @else {
              <div class="listings-grid">
                @for (listing of listings(); track listing.id) {
                  <div class="listing-card" (click)="selectListing(listing)">
                    <div class="listing-header">
                      <div class="seller-info">
                        <div class="seller-avatar">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                          </svg>
                        </div>
                        <div class="seller-details">
                          <h3 class="seller-name">{{ listing.sellerName }}</h3>
                          <div class="seller-rating">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            4.8 (125 avaliações)
                          </div>
                        </div>
                      </div>
                      <div class="listing-price">
                        <div class="price-amount">R$ {{ formatCurrency(listing.pricePerBtc) }}</div>
                        <div class="price-label">por BTC</div>
                      </div>
                    </div>
                    
                    <div class="listing-details">
                      <div class="detail-row">
                        <div class="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                            <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <span>{{ (listing.availableAmount * 100000000 | number:'1.0-0') }} sats disponível</span>
                        </div>
                        <div class="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          <span>Min: R$ {{ formatCurrency(listing.minPurchase) }}</span>
                        </div>
                      </div>
                      
                      <div class="listing-methods">
                        <div class="payment-method">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                            <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" stroke-width="2"/>
                          </svg>
                          PIX Instantâneo
                        </div>
                      </div>
                    </div>

                    <div class="listing-action">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Step 1: Informar valor da compra -->
        @if (currentStep() === 'step1' && selectedListing()) {
          <div class="step-container">
            <div class="step-card">
              <div class="step-info">
                <h3>Preço por Bitcoin: <span class="highlight">R$ {{ formatCurrency(selectedListing()!.pricePerBtc) }}</span></h3>
                <p>Valor máximo que você pode comprar: <span class="highlight">R$ {{ formatCurrency(selectedListing()!.maxPurchase) }}</span></p>
              </div>

              <div class="form-group">
                <label for="amountBrl">Valor que deseja comprar (R$)</label>
                <input
                  type="number"
                  id="amountBrl"
                  [value]="purchaseData().amountBrl"
                  (input)="onAmountBrlChange(+$any($event.target).value)"
                  [min]="selectedListing()!.minPurchase"
                  [max]="selectedListing()!.maxPurchase"
                  step="0.01"
                  class="form-input"
                  placeholder="Digite o valor em reais"
                >
                @if (!canProceedFromStep1() && purchaseData().amountBrl > 0) {
                  <div class="error-message">
                    O valor deve estar entre R$ {{ formatCurrency(selectedListing()!.minPurchase) }} e R$ {{ formatCurrency(selectedListing()!.maxPurchase) }}.
                  </div>
                }
              </div>

              <div class="calculation-result">
                <p>Você irá receber: <span class="btc-amount">{{ (purchaseData().amountBtc * 100000000 | number:'1.0-0') }} sats</span></p>
                <p class="btc-equivalent">({{ purchaseData().amountBtc.toFixed(8) }} BTC)</p>
              </div>

              <div class="step-actions">
                <button type="button" class="btn btn-outline" (click)="goBack()">
                  Voltar
                </button>
                <button 
                  type="button" 
                  class="btn btn-primary"
                  [disabled]="!canProceedFromStep1()"
                  (click)="proceedToStep2()"
                >
                  Prosseguir
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Step 2: Instruções e confirmação -->
        @if (currentStep() === 'step2' && selectedListing()) {
          <div class="step-container">
            <div class="step-card warning-card">
              <div class="warning-section">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <h3>Atenção!</h3>
                  <p>Após o pagamento via Pix, será necessário informar os <strong>3 últimos caracteres</strong> do ID da transação que aparecem no comprovante.</p>
                  <div class="example-box">
                    <p>Exemplo: Se o ID for E000-12A9Z7, você deve informar <span class="highlight-chars">9Z7</span></p>
                  </div>
                </div>
              </div>

              <div class="balance-check">
                <p>Certifique-se de ter saldo suficiente em sua conta para realizar o Pix no valor de <strong>R$ {{ formatCurrency(purchaseData().amountBrl) }}</strong>.</p>
                <p>Ao confirmar, o sistema irá alocar os Bitcoins para garantir a sua compra.</p>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [checked]="purchaseData().userAgreed"
                    (change)="onAgreementChange($any($event.target).checked)"
                  >
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">Estou ciente e tenho saldo para realizar o Pix.</span>
                </label>
              </div>

              <div class="step-actions">
                <button type="button" class="btn btn-outline" (click)="goBack()">
                  Voltar
                </button>
                <button 
                  type="button" 
                  class="btn btn-primary"
                  [disabled]="!purchaseData().userAgreed"
                  (click)="proceedToStep3()"
                >
                  Confirmar e continuar
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Step 3: Pagamento via Pix -->
        @if (currentStep() === 'step3' && selectedListing()) {
          <div class="step-container">
            <div class="step-card payment-card">
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
                  <div class="payment-amount">R$ {{ formatCurrency(purchaseData().amountBrl) }}</div>
                </div>

                <div class="pix-section">
                  <label>Chave Pix:</label>
                  <div class="pix-key-container">
                    <input type="text" readonly [value]="pixKeyFromAPI()" class="pix-key-input">
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
                    [value]="purchaseData().transactionId"
                    (input)="onTransactionIdChange($any($event.target).value)"
                    [disabled]="purchaseData().noTransactionId"
                    class="form-input transaction-input"
                    [class.disabled]="purchaseData().noTransactionId"
                    placeholder="Ex: 7A9"
                    autocomplete="off"
                  >
                  <div class="input-help">
                    <span class="help-icon">ℹ️</span>
                    O ID aparece no comprovante Pix. Informe apenas os 3 últimos caracteres (letras e/ou números) para validar seu pagamento.
                  </div>
                  @if (purchaseData().transactionId.length > 0 && !canConfirmPayment() && !purchaseData().noTransactionId) {
                    <div class="error-message">
                      Informe exatamente 3 caracteres, que podem ser letras e/ou números.
                    </div>
                  }
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      [checked]="purchaseData().noTransactionId"
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
                  (click)="confirmPayment()"
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
    .buy-page {
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

    /* Price Info Card */
    .price-info-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      margin-bottom: var(--spacing-xl);
      border-left: 4px solid var(--primary-orange);
    }

    .price-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      color: var(--primary-orange);
    }

    .price-content {
      flex: 1;
    }

    .price-label {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
      margin-bottom: var(--spacing-xs);
    }

    .price-value {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--text-primary);
    }

    /* Section Header */
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

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
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

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-lg);
      padding: var(--spacing-2xl);
      text-align: center;
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
    }

    .empty-icon {
      color: var(--text-muted);
    }

    .empty-state h3 {
      font-size: var(--font-size-lg);
      color: var(--text-primary);
      margin: 0;
    }

    .empty-state p {
      color: var(--text-secondary);
      margin: 0;
    }

    /* Listings Grid */
    .listings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: var(--spacing-lg);
    }

    .listing-card {
      padding: var(--spacing-lg);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      cursor: pointer;
      transition: all var(--transition-normal);
      position: relative;
    }

    .listing-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-orange);
    }

    .listing-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-md);
    }

    .seller-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .seller-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      color: var(--primary-blue);
    }

    .seller-name {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .seller-rating {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }

    .seller-rating svg {
      color: var(--warning-yellow);
    }

    .listing-price {
      text-align: right;
    }

    .price-amount {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--primary-orange);
      margin-bottom: var(--spacing-xs);
    }

    .price-label {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }

    .listing-details {
      margin-bottom: var(--spacing-md);
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-sm);
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }

    .detail-item svg {
      color: var(--text-muted);
    }

    .listing-methods {
      display: flex;
      gap: var(--spacing-sm);
    }

    .payment-method {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--background-elevated);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      color: var(--success-green);
      font-weight: 500;
    }

    .listing-action {
      position: absolute;
      top: var(--spacing-lg);
      right: var(--spacing-lg);
      color: var(--text-muted);
      transition: all var(--transition-normal);
    }

    .listing-card:hover .listing-action {
      color: var(--primary-orange);
      transform: translateX(4px);
    }

    /* Purchase Section */
    .purchase-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .selected-listing-card {
      padding: var(--spacing-lg);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      border-left: 4px solid var(--primary-blue);
    }

    .listing-summary h3 {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
    }

    .summary-details {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--font-size-sm);
    }

    .summary-item span:first-child {
      color: var(--text-secondary);
    }

    .summary-item span:last-child {
      color: var(--text-primary);
      font-weight: 500;
    }

    .purchase-form-card {
      padding: var(--spacing-xl);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
    }

    .purchase-form-card h3 {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-lg) 0;
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

    .readonly-input {
      padding: var(--spacing-md);
      background: var(--background-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      color: var(--text-primary);
      font-size: var(--font-size-md);
      font-weight: 600;
    }

    .input-info {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      margin-top: var(--spacing-xs);
    }

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

    /* Responsividade */
    @media (max-width: 768px) {
      .buy-page {
        padding: var(--spacing-lg) 0;
      }

      .page-header {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .listings-grid {
        grid-template-columns: 1fr;
      }

      .listing-header {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .seller-info {
        align-self: flex-start;
      }

      .listing-price {
        text-align: left;
      }

      .form-actions, .step-actions {
        flex-direction: column;
      }
    }

    @media (max-width: 480px) {
      .price-info-card {
        flex-direction: column;
        text-align: center;
      }

      .section-header {
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: stretch;
      }

      .detail-row {
        flex-direction: column;
      }
    }

    /* Step Container Styles */
    .step-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .step-card {
      padding: var(--spacing-xl);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
    }

    /* Step 1 Styles */
    .step-info {
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      border-left: 4px solid var(--primary-orange);
    }

    .step-info h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--text-primary);
      font-size: var(--font-size-lg);
    }

    .step-info p {
      margin: 0;
      color: var(--text-secondary);
    }

    .highlight {
      color: var(--primary-orange);
      font-weight: 600;
    }

    .calculation-result {
      margin: var(--spacing-lg) 0;
      padding: var(--spacing-md);
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      text-align: center;
    }

    .btc-amount {
      color: var(--primary-blue);
      font-weight: 700;
      font-size: var(--font-size-lg);
    }

    .btc-equivalent {
      color: var(--text-muted);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
    }

    .step-actions {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      margin-top: var(--spacing-xl);
    }

    .error-message {
      color: var(--error-red);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    /* Step 2 Styles */
    .warning-card {
      border-left: 4px solid var(--warning-yellow);
    }

    .warning-section {
      display: flex;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);
      background: rgba(255, 193, 7, 0.1);
      border-radius: var(--border-radius-md);
    }

    .warning-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .warning-content h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--warning-yellow);
      font-size: var(--font-size-lg);
    }

    .warning-content p {
      margin: 0 0 var(--spacing-md) 0;
      color: var(--text-primary);
    }

    .example-box {
      padding: var(--spacing-md);
      background: var(--background-card);
      border-radius: var(--border-radius-sm);
      border: 1px solid var(--border-color);
    }

    .example-box p {
      margin: 0;
      font-size: var(--font-size-sm);
    }

    .highlight-chars {
      background: var(--warning-yellow);
      color: var(--background-dark);
      padding: 2px 4px;
      border-radius: 3px;
      font-weight: 700;
    }

    .balance-check {
      margin-bottom: var(--spacing-xl);
      padding: var(--spacing-lg);
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
    }

    .balance-check p {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--text-primary);
    }

    .balance-check p:last-child {
      margin-bottom: 0;
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

    /* Step 3 Styles */
    .payment-card {
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
  `]
})
export class BuyComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  protected transactionService = inject(TransactionService);
  protected userService = inject(UserService);
  protected loadingService = inject(LoadingService);
  private advertisementService = inject(AdvertisementService);
  private buyService = inject(BuyService);

  // Convert to signals
  listings = signal<BitcoinListing[]>([]);
  selectedListing = signal<BitcoinListing | null>(null);
  isLoadingListings = signal(false);
  
  // Purchase flow state
  currentStep = signal<'listings' | 'step1' | 'step2' | 'step3'>('listings');
  purchaseData = signal({
    amountBrl: 0,
    amountBtc: 0,
    pixKey: '',
    userAgreed: false,
    transactionId: '',
    noTransactionId: false
  });
  
  // PIX key from API response
  pixKeyFromAPI = signal<string>('');
  
  // Timer for payment step
  paymentTimeLeft = signal(900); // 15 minutes in seconds
  private paymentTimer: any;

  ngOnInit() {
    this.loadListings();
  }

  loadListings() {
    console.log('Loading listings started...'); // Debug log
    this.isLoadingListings.set(true);
    
    // Get ready advertisements with active_only filter
    this.advertisementService.getReadyAdvertisements(true, 1, 50).subscribe({
      next: (response) => {
        console.log('API Response received:', response); // Debug log
        try {
          const mappedListings = this.mapAdvertisementsToListings(response.data);
          this.listings.set(mappedListings);
          console.log('Mapped listings successfully:', mappedListings); // Debug log
          this.isLoadingListings.set(false);
          console.log('Loading state set to false'); // Debug log
        } catch (error) {
          console.error('Error mapping advertisements:', error);
          this.listings.set([]);
          this.isLoadingListings.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading advertisements:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url
        });
        this.listings.set([]);
        this.isLoadingListings.set(false);
        console.log('Loading state set to false after error'); // Debug log
      },
      complete: () => {
        console.log('Advertisement loading observable completed'); // Debug log
      }
    });
  }

  /**
   * Maps Advertisement objects to BitcoinListing objects for compatibility
   */
  private mapAdvertisementsToListings(advertisements: Advertisement[]): BitcoinListing[] {
    return advertisements.map(ad => {
      console.log('Raw advertisement data:', ad); // Debug log
      
      // Following sell component standard - assume API returns values in satoshis
      const rawPrice = Number(ad.price);
      const rawAvailableAmount = Number(ad.available_amount);
      
      console.log('Raw price (sats):', rawPrice, 'Raw available_amount (sats):', rawAvailableAmount);
      
      // Convert from satoshis to BRL/BTC (following SATS_PER_BTC standard)
      const pricePerBtc = Math.floor(rawPrice / Number(this.SATS_PER_BTC));
      
      // Convert available amount from satoshis to BTC
      const availableAmountBtc = rawAvailableAmount / Number(this.SATS_PER_BTC);
      
      const mapped = {
        id: ad.id,
        sellerId: ad.seller_address,
        sellerName: this.formatSellerName(ad.seller_address),
        pricePerBtc: pricePerBtc,
        availableAmount: Math.max(availableAmountBtc, 0.001), // Ensure minimum viable amount
        minPurchase: 100, // Default minimum purchase in BRL (integer value)
        maxPurchase: Math.floor(availableAmountBtc * pricePerBtc), // Maximum based on available BTC (integer value)
        pixKey: 'PIX disponível', // Placeholder since PIX key isn't in Advertisement model
        createdAt: new Date(ad.created_at)
      };
      
      console.log('Final mapped listing:', mapped); // Debug log
      return mapped;
    });
  }

  /**
   * Formats seller address to a more user-friendly name
   */
  private formatSellerName(address: string): string {
    return `Vendedor ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  updatePurchaseDataAmount(amount: number) {
    this.purchaseData.update(data => ({
      ...data,
      amountBrl: amount,
      amountBtc: this.selectedListing() ? amount / this.selectedListing()!.pricePerBtc : 0
    }));
  }

  updatePurchaseDataPixKey(pixKey: string) {
    this.purchaseData.update(data => ({
      ...data,
      pixKey: pixKey
    }));
  }

  selectListing(listing: BitcoinListing) {
    this.selectedListing.set(listing);
    this.currentStep.set('step1');
    this.purchaseData.set({
      amountBrl: listing.minPurchase,
      amountBtc: listing.minPurchase / listing.pricePerBtc,
      pixKey: '',
      userAgreed: false,
      transactionId: '',
      noTransactionId: false
    });
  }

  cancelPurchase() {
    this.selectedListing.set(null);
    this.currentStep.set('listings');
    this.clearPaymentTimer();
    this.purchaseData.set({
      amountBrl: 0,
      amountBtc: 0,
      pixKey: '',
      userAgreed: false,
      transactionId: '',
      noTransactionId: false
    });
  }

  // Step 1 methods

  getTotalValue(): number {
    const currentPurchaseData = this.purchaseData();
    return currentPurchaseData.amountBrl;
  }

  formatCurrency(value: number): string {
    // Round to avoid decimal places for large currency values (following sell component standard)
    const roundedValue = Math.round(value);
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(roundedValue);
  }

  goBack() {
    if (this.currentStep() === 'step1') {
      this.currentStep.set('listings');
      this.selectedListing.set(null);
    } else if (this.currentStep() === 'step2') {
      this.currentStep.set('step1');
    } else if (this.currentStep() === 'step3') {
      this.currentStep.set('step2');
      this.clearPaymentTimer();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Step 1 methods
  onAmountBrlChange(amount: number) {
    const listing = this.selectedListing();
    if (!listing) return;
    
    this.purchaseData.update(data => ({
      ...data,
      amountBrl: amount,
      amountBtc: amount / listing.pricePerBtc
    }));
  }

  canProceedFromStep1(): boolean {
    const listing = this.selectedListing();
    const data = this.purchaseData();
    if (!listing) return false;
    
    return data.amountBrl >= listing.minPurchase && 
           data.amountBrl <= listing.maxPurchase;
  }

  proceedToStep2() {
    if (this.canProceedFromStep1()) {
      this.currentStep.set('step2');
    }
  }

  // Step 2 methods
  onAgreementChange(agreed: boolean) {
    this.purchaseData.update(data => ({
      ...data,
      userAgreed: agreed
    }));
  }

  // Constants for satoshi conversions
  readonly SATS_PER_BTC = 100000000n; // 100 million satoshis per bitcoin as BigInt

  proceedToStep3() {
    if (!this.purchaseData().userAgreed) return;

    const listing = this.selectedListing();
    const purchaseData = this.purchaseData();
    
    if (!listing) return;

    // Show loading state
    this.loadingService.show('Iniciando compra...');

    // Convert amounts to satoshis for API call (following sell component standard)
    const amountSats = Math.floor(purchaseData.amountBtc * Number(this.SATS_PER_BTC));
    const priceSats = Math.floor(listing.pricePerBtc * Number(this.SATS_PER_BTC));

    // Call BuyService.startBuy with satoshi values
    this.buyService.startBuy(
      amountSats,
      priceSats,
      listing.id
    ).subscribe({
      next: (buyResponse) => {
        // Store the PIX key from the API response
        this.pixKeyFromAPI.set(buyResponse.pix_key);
        
        // Move to step 3 and start the payment timer
        this.currentStep.set('step3');
        this.startPaymentTimer();
        
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Erro ao iniciar compra:', error);
        this.loadingService.hide();
        
        // Show error message to user
        alert('Erro ao iniciar a compra. Tente novamente.');
      }
    });
  }

  // Step 3 methods
  startPaymentTimer() {
    this.paymentTimeLeft.set(900); // 15 minutes
    this.paymentTimer = setInterval(() => {
      const currentTime = this.paymentTimeLeft();
      if (currentTime <= 0) {
        this.clearPaymentTimer();
        this.cancelPurchaseDueToTimeout();
      } else {
        this.paymentTimeLeft.set(currentTime - 1);
      }
    }, 1000);
  }

  clearPaymentTimer() {
    if (this.paymentTimer) {
      clearInterval(this.paymentTimer);
      this.paymentTimer = null;
    }
  }

  cancelPurchaseDueToTimeout() {
    // Handle timeout - could show a message and redirect
    this.cancelPurchase();
    alert('O tempo de pagamento foi excedido. Sua compra foi cancelada e os Bitcoins foram liberados.');
  }

  getFormattedTime(): string {
    const time = this.paymentTimeLeft();
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  onTransactionIdChange(transactionId: string) {
    this.purchaseData.update(data => ({
      ...data,
      transactionId: transactionId.toUpperCase(),
      noTransactionId: transactionId.length === 0 ? data.noTransactionId : false
    }));
  }

  onNoTransactionIdChange(noTransactionId: boolean) {
    this.purchaseData.update(data => ({
      ...data,
      noTransactionId: noTransactionId,
      transactionId: noTransactionId ? '' : data.transactionId
    }));
  }

  canConfirmPayment(): boolean {
    const data = this.purchaseData();
    if (data.noTransactionId) {
      return true;
    }
    return data.transactionId.length === 3 && /^[A-Z0-9]{3}$/.test(data.transactionId);
  }

  copyPixKey() {
    const pixKey = this.pixKeyFromAPI();
    if (pixKey) {
      navigator.clipboard.writeText(pixKey).then(() => {
        // Could show a toast notification here
        console.log('PIX key copied to clipboard');
        alert('Chave PIX copiada para a área de transferência!');
      }).catch(() => {
        console.error('Failed to copy PIX key');
        alert('Erro ao copiar chave PIX. Copie manualmente.');
      });
    }
  }

  confirmPayment() {
    if (!this.canConfirmPayment()) return;

    const currentListing = this.selectedListing();
    const currentPurchaseData = this.purchaseData();
    
    if (!currentListing) return;
    
    this.transactionService.createPurchaseOrder(
      currentListing.id, 
      currentPurchaseData.amountBtc, 
      currentPurchaseData.pixKey
    ).subscribe({
      next: (order) => {
        this.clearPaymentTimer();
        this.router.navigate(['/pending-approval'], { 
          queryParams: { orderId: order.id } 
        });
      },
      error: (error) => {
        console.error('Erro ao criar pedido:', error);
      }
    });
  }

  ngOnDestroy() {
    this.clearPaymentTimer();
  }
}
