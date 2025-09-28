import { Component, inject, OnInit, OnDestroy, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { LoadingService } from '../../services/loading.service';
import { AdvertisementService } from '../../shared/api/advertisement.service';
import { BuyService } from '../../shared/api/buy.service';
import { Advertisement, AdvertisementStatus } from '../../shared/models/advertisement.model';
import { Buy } from '../../shared/models/buy.model';
import { BitcoinListing, PurchaseOrder } from '../../interfaces/transaction.interface';

@Component({
  selector: 'app-buy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="buy-page">
      <!-- Main Content -->
      <div class="container">
        <!-- Simple Header -->
        <div class="page-header">
          <button class="btn btn-ghost" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Voltar
          </button>
          <div class="header-content">
            <h1 class="page-title">Comprar Bitcoin</h1>
            <p class="page-subtitle">Escolha uma oferta e compre com PIX instantâneo</p>
          </div>
        </div>

        <!-- Quick Buy Amount Selector -->
        <div class="quick-buy-section">
          <h2 class="section-title">Quanto você quer comprar?</h2>
          <div class="amount-selector">
            <div class="quick-amounts">
              <button
                class="quick-amount-btn"
                [class.active]="selectedQuickAmount() === 100"
                (click)="selectQuickAmount(100)"
              >
                R$ 100
              </button>
              <button
                class="quick-amount-btn"
                [class.active]="selectedQuickAmount() === 250"
                (click)="selectQuickAmount(250)"
              >
                R$ 250
              </button>
              <button
                class="quick-amount-btn"
                [class.active]="selectedQuickAmount() === 500"
                (click)="selectQuickAmount(500)"
              >
                R$ 500
              </button>
              <button
                class="quick-amount-btn"
                [class.active]="selectedQuickAmount() === 1000"
                (click)="selectQuickAmount(1000)"
              >
                R$ 1.000
              </button>
            </div>
            <div class="custom-amount">
              <label for="customAmount">Ou digite o valor:</label>
              <div class="amount-input-group">
                <span class="currency-symbol">R$</span>
                <input
                  type="number"
                  id="customAmount"
                  [value]="customAmount()"
                  (input)="onCustomAmountChange(+$any($event.target).value)"
                  placeholder="0,00"
                  class="amount-input"
                  min="50"
                  max="10000"
                  step="0.01"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Bitcoin Offers -->
        <div class="offers-section">
          <div class="section-header">
            <h2 class="section-title">Ofertas Disponíveis</h2>
            <button class="btn btn-outline btn-sm" (click)="loadListings()">
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
              <p>Buscando as melhores ofertas...</p>
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
              <h3>Nenhuma oferta disponível</h3>
              <p>Não há ofertas de Bitcoin no momento. Tente novamente mais tarde.</p>
              <button class="btn btn-primary" (click)="loadListings()">Tentar Novamente</button>
            </div>
          } @else {
            <div class="offers-grid">
              @for (listing of listings(); track listing.id) {
                <div class="offer-card">
                  <!-- Seller Trust Indicator -->
                  <div class="seller-header">
                    <div class="seller-avatar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </div>
                    <div class="seller-info">
                      <h3 class="seller-name">{{ listing.sellerName }}</h3>
                      <div class="trust-score">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
                        </svg>
                        Verificado
                      </div>
                    </div>
                    <div class="best-price-badge" *ngIf="isLowestPrice(listing)">
                      <span>Melhor Preço</span>
                    </div>
                  </div>

                  <!-- Price Display -->
                  <div class="price-display">
                    <div class="bitcoin-price">
                      <span class="price-label">Bitcoin a</span>
                      <span class="price-value">R$ {{ formatCurrency(listing.pricePerBtc) }}</span>
                    </div>

                    @if (getCurrentAmount() > 0) {
                      <div class="you-get">
                        <span class="you-get-label">Você recebe:</span>
                        <span class="bitcoin-amount">{{ formatBitcoinAmount(calculateBitcoinAmount(listing, getCurrentAmount())) }}</span>
                        <span class="bitcoin-symbol">BTC</span>
                      </div>
                      <div class="total-cost">
                        <span class="total-label">Total:</span>
                        <span class="total-value">R$ {{ formatCurrency(getCurrentAmount()) }}</span>
                      </div>
                    }
                  </div>

                  <!-- Buy Button -->
                  <div class="buy-action">
                    @if (getCurrentAmount() > 0 && canBuyWithAmount(listing, getCurrentAmount())) {
                      <button
                        class="btn btn-success btn-lg buy-btn"
                        (click)="buyInstant(listing)"
                        [disabled]="isProcessingPurchase()"
                      >
                        @if (isProcessingPurchase()) {
                          <div class="loading-spinner-sm"></div>
                          Processando...
                        } @else {
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          </svg>
                          Comprar com PIX
                        }
                      </button>
                    } @else if (getCurrentAmount() === 0) {
                      <button class="btn btn-outline btn-lg" disabled>
                        Escolha um valor acima
                      </button>
                    } @else {
                      <button class="btn btn-outline btn-lg" disabled>
                        Valor mín: R$ {{ formatCurrency(listing.minPurchase) }}
                      </button>
                    }
                  </div>

                  <!-- Limits Display -->
                  <div class="limits-info">
                    <div class="limit-item">
                      <span class="limit-label">Mínimo:</span>
                      <span class="limit-value">R$ {{ formatCurrency(listing.minPurchase) }}</span>
                    </div>
                    <div class="limit-item">
                      <span class="limit-label">Máximo:</span>
                      <span class="limit-value">R$ {{ formatCurrency(getEffectiveMaxPurchase(listing)) }}</span>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Purchase Confirmation Modal -->
        @if (showConfirmationModal()) {
          <div class="modal-overlay" (click)="closeConfirmationModal()">
            <div class="confirmation-modal" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>Confirmar Compra</h3>
                <button class="close-btn" (click)="closeConfirmationModal()">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>

              @if (selectedListing()) {
                <div class="modal-content">
                  <div class="purchase-summary">
                    <div class="summary-item">
                      <span class="label">Você está comprando:</span>
                      <span class="value">{{ formatBitcoinAmount(calculateBitcoinAmount(selectedListing()!, getCurrentAmount())) }} BTC</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Por:</span>
                      <span class="value strong">R$ {{ formatCurrency(getCurrentAmount()) }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">Taxa de câmbio:</span>
                      <span class="value">R$ {{ formatCurrency(selectedListing()!.pricePerBtc) }}/BTC</span>
                    </div>
                  </div>

                  <div class="payment-info">
                    <div class="info-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Você receberá as instruções de pagamento PIX na próxima tela
                    </div>
                  </div>

                  <div class="modal-actions">
                    <button class="btn btn-outline" (click)="closeConfirmationModal()">
                      Cancelar
                    </button>
                    <button
                      class="btn btn-success btn-lg"
                      (click)="confirmPurchase()"
                      [disabled]="isProcessingPurchase()"
                    >
                      @if (isProcessingPurchase()) {
                        <div class="loading-spinner-sm"></div>
                        Processando...
                      } @else {
                        Confirmar Compra
                      }
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* Global text selection fix */
    .buy-page ::selection {
      background: #3B82F6;
      color: #FFFFFF;
    }

    .buy-page ::-moz-selection {
      background: #3B82F6;
      color: #FFFFFF;
    }

    .buy-page {
      min-height: 100vh;
      background: #F8FAFC;
      padding: 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    /* Header */
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

    /* Quick Buy Section */
    .quick-buy-section {
      margin-bottom: 32px;
      padding: 24px;
      background: #FFFFFF;
      border-radius: 16px;
      border: 1px solid #E5E7EB;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 24px;
      text-align: center;
    }

    .quick-amounts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .quick-amount-btn {
      padding: 16px 24px;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      background: #FFFFFF;
      color: #1F2937;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .quick-amount-btn:hover {
      border-color: #1E40AF;
      background: #EFF6FF;
    }

    .quick-amount-btn.active {
      border-color: #1E40AF;
      background: #1E40AF;
      color: white;
      box-shadow: 0 10px 15px -3px rgb(30 64 175 / 0.1);
    }

    .custom-amount {
      padding-top: 24px;
      border-top: 1px solid #E5E7EB;
    }

    .custom-amount label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #1F2937;
      margin-bottom: 12px;
    }

    .amount-input-group {
      display: flex;
      align-items: center;
      border: 2px solid #E5E7EB;
      border-radius: 12px;
      overflow: hidden;
      transition: border-color 0.2s ease;
      max-width: 300px;
    }

    .amount-input-group:focus-within {
      border-color: #1E40AF;
      box-shadow: 0 0 0 3px #EFF6FF;
    }

    .currency-symbol {
      padding: 16px;
      background: #F9FAFB;
      color: #6B7280;
      font-weight: 500;
      border-right: 1px solid #E5E7EB;
    }

    .amount-input {
      flex: 1;
      padding: 16px;
      border: none;
      background: #FFFFFF;
      color: #1F2937;
      font-size: 16px;
      font-weight: 500;
      outline: none;
    }

    .amount-input::selection {
      background: #3B82F6;
      color: #FFFFFF;
    }

    .amount-input::-moz-selection {
      background: #3B82F6;
      color: #FFFFFF;
    }

    /* Common Button Styles */
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

    .btn-success {
      background: #16A34A;
      color: #FFFFFF;
      border-color: #16A34A;
      font-weight: 700;
      box-shadow: 0 2px 4px 0 rgb(22 163 74 / 0.3);
    }

    .btn-success:hover:not(:disabled) {
      background: #15803D;
      border-color: #15803D;
      box-shadow: 0 4px 8px 0 rgb(21 128 61 / 0.4);
      transform: translateY(-1px);
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

    .btn-lg {
      padding: 16px 32px;
      font-size: 16px;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 12px;
    }

    /* Offers Section */
    .offers-section {
      margin-bottom: 32px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .offers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .offer-card {
      background: #FFFFFF;
      border: 2px solid #E5E7EB;
      border-radius: 16px;
      padding: 24px;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .offer-card:hover {
      border-color: #1E40AF;
      box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1);
      transform: translateY(-2px);
    }

    /* Seller Header */
    .seller-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      position: relative;
    }

    .seller-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: #EFF6FF;
      border-radius: 50%;
      color: #1E40AF;
      flex-shrink: 0;
    }

    .seller-info {
      flex: 1;
    }

    .seller-name {
      font-size: 16px;
      font-weight: 600;
      color: #1F2937;
      margin: 0 0 4px 0;
    }

    .trust-score {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #059669;
      font-weight: 500;
    }

    .trust-score svg {
      fill: #059669;
    }

    .best-price-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 4px 6px -1px rgb(245 158 11 / 0.4);
    }

    /* Price Display */
    .price-display {
      margin-bottom: 24px;
      padding: 16px;
      background: #F9FAFB;
      border-radius: 12px;
      border: 1px solid #E5E7EB;
    }

    .bitcoin-price {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 12px;
    }

    .price-label {
      font-size: 14px;
      color: #6B7280;
      font-weight: 500;
    }

    .price-value {
      font-size: 20px;
      font-weight: 700;
      color: #F59E0B;
    }

    .you-get {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      padding: 12px;
      background: #ECFDF5;
      border-radius: 8px;
      border: 1px solid #A7F3D0;
    }

    .you-get-label {
      font-size: 14px;
      color: #6B7280;
    }

    .bitcoin-amount {
      font-size: 18px;
      font-weight: 700;
      color: #059669;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }

    .bitcoin-symbol {
      font-size: 14px;
      color: #059669;
      font-weight: 600;
    }

    .total-cost {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid #E5E7EB;
    }

    .total-label {
      font-size: 14px;
      color: #6B7280;
    }

    .total-value {
      font-size: 18px;
      font-weight: 700;
      color: #1F2937;
    }

    /* Buy Action */
    .buy-action {
      margin-bottom: 16px;
    }

    .buy-btn {
      width: 100%;
      font-weight: 700;
      border-radius: 12px;
      font-size: 16px;
      background: #16A34A !important;
      color: #FFFFFF !important;
      border: 2px solid #16A34A !important;
      box-shadow: 0 4px 12px 0 rgb(22 163 74 / 0.4);
      text-shadow: 0 1px 2px rgb(0 0 0 / 0.1);
    }

    .buy-btn:hover:not(:disabled) {
      background: #15803D !important;
      border-color: #15803D !important;
      color: #FFFFFF !important;
      box-shadow: 0 6px 16px 0 rgb(21 128 61 / 0.5);
      transform: translateY(-2px);
    }

    .buy-btn:disabled {
      background: #9CA3AF !important;
      border-color: #9CA3AF !important;
      color: #FFFFFF !important;
      opacity: 0.7;
      transform: none;
      box-shadow: none;
    }

    .loading-spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Limits Info */
    .limits-info {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 12px;
      background: #F9FAFB;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    }

    .limit-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .limit-label {
      font-size: 12px;
      color: #9CA3AF;
      font-weight: 500;
    }

    .limit-value {
      font-size: 14px;
      color: #1F2937;
      font-weight: 600;
    }

    /* Loading & Empty States */
    .loading-state, .empty-state {
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

    .empty-state {
      background: #FFFFFF;
      border-radius: 16px;
      border: 2px dashed #E5E7EB;
    }

    .empty-icon {
      color: #9CA3AF;
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

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Confirmation Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .confirmation-modal {
      background: #FFFFFF;
      border-radius: 24px;
      border: 1px solid #E5E7EB;
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px;
      border-bottom: 1px solid #E5E7EB;
    }

    .modal-header h3 {
      font-size: 20px;
      font-weight: 600;
      color: #1F2937;
      margin: 0;
    }

    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: #9CA3AF;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: #F9FAFB;
      color: #1F2937;
    }

    .modal-content {
      padding: 24px;
    }

    .purchase-summary {
      margin-bottom: 24px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #E5E7EB;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-item .label {
      font-size: 14px;
      color: #6B7280;
    }

    .summary-item .value {
      font-size: 16px;
      color: #1F2937;
      font-weight: 500;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }

    .summary-item .value.strong {
      font-size: 18px;
      font-weight: 700;
      color: #F59E0B;
    }

    .payment-info {
      margin-bottom: 24px;
    }

    .info-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #EFF6FF;
      border-radius: 12px;
      border: 1px solid #BFDBFE;
      font-size: 14px;
      color: #1F2937;
    }

    .info-badge svg {
      color: #1E40AF;
      flex-shrink: 0;
    }

    .modal-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .container {
        padding: 0 12px;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .quick-amounts {
        grid-template-columns: repeat(2, 1fr);
      }

      .offers-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .offer-card {
        padding: 16px;
      }

      .seller-header {
        flex-wrap: wrap;
      }

      .best-price-badge {
        position: static;
        align-self: flex-start;
        margin-top: 8px;
      }

      .modal-actions {
        flex-direction: column;
      }

      .confirmation-modal {
        margin: 8px;
        max-height: calc(100vh - 16px);
      }
    }

    @media (max-width: 480px) {
      .quick-amounts {
        grid-template-columns: 1fr;
      }

      .limits-info {
        flex-direction: column;
        gap: 8px;
      }

      .limit-item {
        flex-direction: row;
        justify-content: space-between;
      }

      .bitcoin-price {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .you-get {
        flex-wrap: wrap;
      }
    }



    /* Legacy Step Styles - Remove when cleaning up */
    .step-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .step-card {
      padding: var(--spacing-6);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
    }

    /* Step 1 Styles */
    .step-info {
      margin-bottom: var(--spacing-8);
      padding: var(--spacing-6);
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      border-left: 4px solid var(--primary-bitcoin-orange);
    }

    .step-info h3 {
      margin: 0 0 var(--spacing-3) 0;
      color: var(--text-primary);
      font-size: var(--font-size-lg);
    }

    .step-info p {
      margin: 0;
      color: var(--text-secondary);
    }

    .availability-notice {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);
      margin-top: var(--spacing-3) !important;
      padding: var(--spacing-4);
      background: rgba(255, 193, 7, 0.1);
      border: 1px solid var(--border-warning);
      border-radius: var(--border-radius-md);
      color: var(--text-warning) !important;
      font-size: var(--font-size-sm);
    }

    .availability-notice svg {
      flex-shrink: 0;
      color: var(--text-warning);
      margin-top: 2px;
    }

    .availability-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .availability-details div {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .availability-details strong {
      color: var(--text-primary);
      font-weight: 600;
    }

    .highlight {
      color: var(--primary-bitcoin-orange);
      font-weight: 600;
    }

    .calculation-result {
      margin: var(--spacing-6) 0;
      padding: var(--spacing-4);
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      text-align: center;
    }

    .btc-amount {
      color: var(--primary-trust-blue);
      font-weight: 700;
      font-size: var(--font-size-lg);
    }

    .btc-equivalent {
      color: var(--text-muted);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-2);
    }

    .step-actions {
      display: flex;
      gap: var(--spacing-4);
      justify-content: flex-end;
      margin-top: var(--spacing-8);
    }

    .error-message {
      color: var(--text-error);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-2);
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    /* Step 2 Styles */
    .warning-card {
      border-left: 4px solid var(--border-warning);
    }

    .warning-section {
      display: flex;
      gap: var(--spacing-4);
      margin-bottom: var(--spacing-8);
      padding: var(--spacing-6);
      background: rgba(255, 193, 7, 0.1);
      border-radius: var(--border-radius-md);
    }

    .warning-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .warning-content h3 {
      margin: 0 0 var(--spacing-3) 0;
      color: var(--text-warning);
      font-size: var(--font-size-lg);
    }

    .warning-content p {
      margin: 0 0 var(--spacing-4) 0;
      color: var(--text-primary);
    }

    .example-box {
      padding: var(--spacing-4);
      background: var(--background-card);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--border-color);
    }

    .example-box p {
      margin: 0;
      font-size: var(--font-size-sm);
    }

    .highlight-chars {
      background: var(--background-warning);
      color: var(--text-primary);
      padding: 2px 4px;
      border-radius: 3px;
      font-weight: 700;
    }

    .balance-check {
      margin-bottom: var(--spacing-8);
      padding: var(--spacing-6);
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
    }

    .balance-check p {
      margin: 0 0 var(--spacing-3) 0;
      color: var(--text-primary);
    }

    .balance-check p:last-child {
      margin-bottom: 0;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      cursor: pointer;
      font-size: var(--font-size-base);
      color: var(--text-primary);
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
      border: 2px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      background: var(--background-elevated);
      position: relative;
      transition: all var(--transition-normal);
      flex-shrink: 0;
      display: inline-block;
      box-sizing: border-box;
    }

    .checkbox-custom:hover {
      border-color: var(--primary-bitcoin-orange);
    }

    .checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
      background: var(--primary-bitcoin-orange);
      border-color: var(--primary-bitcoin-orange);
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
      border-left: 4px solid var(--border-success);
    }

    .payment-header {
      margin-bottom: var(--spacing-8);
    }

    .timer-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      padding: var(--spacing-6);
      background: rgba(255, 193, 7, 0.1);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--border-warning);
    }

    .timer-icon {
      font-size: 24px;
    }

    .timer-content p {
      margin: 0 0 var(--spacing-2) 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .timer-display {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--text-warning);
      font-family: var(--font-family-mono);
    }

    .payment-info {
      margin-bottom: var(--spacing-8);
    }

    .amount-section {
      margin-bottom: var(--spacing-6);
      text-align: center;
    }

    .amount-section p {
      margin: 0 0 var(--spacing-2) 0;
      color: var(--text-secondary);
    }

    .payment-amount {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--primary-bitcoin-orange);
    }

    .pix-section label {
      display: block;
      margin-bottom: var(--spacing-2);
      color: var(--text-primary);
      font-weight: 500;
    }

    .pix-key-container {
      display: flex;
      gap: var(--spacing-3);
      align-items: center;
    }

    .pix-key-input {
      flex: 1;
      padding: var(--spacing-4);
      background: var(--background-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      color: var(--text-primary);
      font-family: var(--font-family-mono);
    }

    .transaction-id-section {
      margin-bottom: var(--spacing-8);
    }

    .transaction-input {
      text-transform: uppercase;
      font-family: var(--font-family-mono);
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
      gap: var(--spacing-2);
      margin-top: var(--spacing-2);
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      line-height: 1.4;
    }

    .help-icon {
      flex-shrink: 0;
    }

    .btn-success {
      background: var(--background-success);
      border-color: var(--border-success);
    }

    .btn-success:hover:not(:disabled) {
      background: var(--background-success);
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-danger {
      background: var(--background-error);
      border-color: var(--border-error);
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: var(--background-error);
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

  // Core signals
  listings = signal<BitcoinListing[]>([]);
  selectedListing = signal<BitcoinListing | null>(null);
  isLoadingListings = signal(false);

  // Simplified purchase flow
  selectedQuickAmount = signal<number>(0);
  customAmount = signal<number>(0);
  showConfirmationModal = signal<boolean>(false);
  isProcessingPurchase = signal<boolean>(false);

  // Buy record from API
  buyRecord = signal<Buy | null>(null);

  ngOnInit() {
    this.loadListings();
  }

  loadListings() {
    console.log('Loading listings started...'); // Debug log
    this.isLoadingListings.set(true);
    
    // Get ready advertisements with active_only filter
    this.advertisementService.getReadyAdvertisements(true, 1, 50).subscribe({
      next: (response: any) => {
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
      error: (error: any) => {
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
      
      // API returns price in cents per Bitcoin
      const rawPriceCentsPerBtc = Number(ad.price);
      const rawAvailableAmount = Number(ad.available_amount);
      
      console.log('Raw price (cents per BTC):', rawPriceCentsPerBtc, 'Raw available_amount (sats):', rawAvailableAmount);
      
      // Convert from cents per Bitcoin to BRL per Bitcoin for display
      // price_cents_per_btc / 100_cents_per_real = price_reais_per_btc
      const pricePerBtc = Math.floor(rawPriceCentsPerBtc / 100);
      
      // Keep available amount in satoshis (no conversion needed)
      const availableAmountSats = rawAvailableAmount;
      
      // Convert min/max amounts from cents to reais
      const minPurchaseReais = ad.min_amount / 100;
      const maxPurchaseReais = ad.max_amount / 100;
      
      const mapped = {
        id: ad.id,
        sellerId: ad.seller_address,
        sellerName: this.formatSellerName(ad.seller_address),
        pricePerBtc: pricePerBtc, // This is now in BRL per BTC for display
        availableAmount: Math.max(availableAmountSats, 1000), // Ensure minimum viable amount in sats
        minPurchase: minPurchaseReais, // Use the min_amount from API (converted from cents)
        maxPurchase: maxPurchaseReais, // Use the max_amount from API (converted from cents)
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

  // New simplified interface methods
  selectQuickAmount(amount: number) {
    this.selectedQuickAmount.set(amount);
    this.customAmount.set(amount);
  }

  onCustomAmountChange(amount: number) {
    this.customAmount.set(amount);
    this.selectedQuickAmount.set(0); // Clear quick amount selection
  }

  getCurrentAmount(): number {
    return this.customAmount();
  }

  calculateBitcoinAmount(listing: BitcoinListing, amountBrl: number): number {
    return amountBrl / listing.pricePerBtc;
  }

  formatBitcoinAmount(amount: number): string {
    return amount.toFixed(8);
  }

  canBuyWithAmount(listing: BitcoinListing, amount: number): boolean {
    const effectiveMax = this.getEffectiveMaxPurchase(listing);
    return amount >= listing.minPurchase && amount <= effectiveMax;
  }

  isLowestPrice(listing: BitcoinListing): boolean {
    const allListings = this.listings();
    if (allListings.length === 0) return false;
    const lowestPrice = Math.min(...allListings.map((l: BitcoinListing) => l.pricePerBtc));
    return listing.pricePerBtc === lowestPrice;
  }

  buyInstant(listing: BitcoinListing) {
    this.selectedListing.set(listing);
    this.showConfirmationModal.set(true);
  }

  closeConfirmationModal() {
    this.showConfirmationModal.set(false);
    this.selectedListing.set(null);
  }

  confirmPurchase() {
    const listing = this.selectedListing();
    const amount = this.getCurrentAmount();

    if (!listing || amount <= 0) return;

    this.isProcessingPurchase.set(true);
    this.loadingService.show('Iniciando compra...');

    // Calculate the total amount in cents for the API
    const payAmountCents = Math.round(amount * 100);

    this.buyService.startBuy(payAmountCents, listing.id).subscribe({
      next: (buyResponse: any) => {
        this.buyRecord.set(buyResponse);
        this.isProcessingPurchase.set(false);
        this.loadingService.hide();
        this.showConfirmationModal.set(false);

        // Navigate to payment page
        this.router.navigate(['/buy', buyResponse.id]);
      },
      error: (error: any) => {
        console.error('Erro ao iniciar compra:', error);
        this.isProcessingPurchase.set(false);
        this.loadingService.hide();
        alert('Erro ao iniciar a compra. Tente novamente.');
      }
    });
  }

  // Step 1 methods

  getTotalValue(): number {
    return this.getCurrentAmount();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Calculates the effective maximum purchase amount based on available satoshis
   */
  getEffectiveMaxPurchase(listing: BitcoinListing): number {
    // Calculate the maximum value possible based on available satoshis
    // availableAmount is now in satoshis, convert to BTC then to BRL
    const availableBtc = listing.availableAmount / Number(this.SATS_PER_BTC);
    const maxValueFromAvailability = availableBtc * listing.pricePerBtc;
    
    // Return the smaller of the two: listing max purchase or available value
    return Math.min(listing.maxPurchase, maxValueFromAvailability);
  }

  /**
   * Checks if the maximum purchase is limited by availability rather than listing limit
   */
  isMaxPurchaseLimitedByAvailability(listing: BitcoinListing): boolean {
    const availableBtc = listing.availableAmount / Number(this.SATS_PER_BTC);
    const maxValueFromAvailability = availableBtc * listing.pricePerBtc;
    return maxValueFromAvailability < listing.maxPurchase;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // Constants for satoshi conversions
  readonly SATS_PER_BTC = 100000000n; // 100 million satoshis per bitcoin as BigInt

  ngOnDestroy() {
    // Component cleanup if needed
  }
}
