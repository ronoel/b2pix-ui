import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WalletService } from '../../libs/wallet.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <header class="toolbar" role="banner">
      <div class="container">
        <nav class="toolbar-nav" aria-label="Main navigation">
          <div class="toolbar-left">
            <a class="toolbar-logo" routerLink="/" aria-label="B2Pix - Voltar ao início">
              <div class="logo-icon">
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <circle cx="24" cy="24" r="24" fill="url(#toolbarLogoGradient)"/>
                  <path d="M24 8C15.2 8 8 15.2 8 24C8 32.8 15.2 40 24 40C32.8 40 40 32.8 40 24C40 15.2 32.8 8 24 8ZM24 36C17.4 36 12 30.6 12 24C12 17.4 17.4 12 24 12C30.6 12 36 17.4 36 24C36 30.6 30.6 36 24 36Z" fill="white"/>
                  <path d="M24 16C19.6 16 16 19.6 16 24C16 28.4 19.6 32 24 32C28.4 32 32 28.4 32 24C32 19.6 28.4 16 24 16ZM24 28C21.8 28 20 26.2 20 24C20 21.8 21.8 20 24 20C26.2 20 28 21.8 28 24C28 26.2 26.2 28 24 28Z" fill="white"/>
                </svg>
              </div>
              <div class="logo-text">
                <span class="brand-name">B2Pix</span>
                <span class="brand-subtitle">P2P Bitcoin</span>
              </div>
            </a>
          </div>
          
          <div class="toolbar-right">
            @if (walletService.isLoggedInSignal()) {
              <!-- Wallet Connected State -->
              <div class="wallet-connected">
                <div class="wallet-info">
                  <div class="connection-status">
                    <div class="status-dot"></div>
                    <span class="status-text">Conectado</span>
                  </div>
                  <div class="wallet-address" title="{{ walletService.walletAddressSignal() }}">
                    {{ walletService.walletAddressSignal() ? (walletService.walletAddressSignal() | slice:0:4 ) + '...' + (walletService.walletAddressSignal() | slice:-4 ) : '' }}
                  </div>
                </div>
                <button class="btn btn-ghost disconnect-btn" (click)="disconnect()" aria-label="Desconectar Wallet">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span class="btn-text">Sair</span>
                </button>
              </div>
            } @else {
              <!-- Wallet Disconnected State -->
              <div class="wallet-disconnected">
                <button class="btn btn-primary connect-btn" (click)="connect()" aria-label="Conectar Wallet">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="btn-text">Conectar Wallet</span>
                </button>
                <div class="connection-hint">
                  <span>Stacks Wallet necessária</span>
                </div>
              </div>
            }
          </div>
        </nav>
      </div>
      
      <!-- SVG Definitions -->
      <svg width="0" height="0">
        <defs>
          <linearGradient id="toolbarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:var(--primary-bitcoin-orange)"/>
            <stop offset="100%" style="stop-color:var(--primary-bitcoin-orange-light)"/>
          </linearGradient>
        </defs>
      </svg>
    </header>
  `,
  styles: [`
    /* Global text selection fix for toolbar */
    .toolbar ::selection {
      background: var(--primary-trust-blue-light);
      color: var(--text-inverse);
    }

    .toolbar ::-moz-selection {
      background: var(--primary-trust-blue-light);
      color: var(--text-inverse);
    }

    /* Container */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-4);
    }

    /* Main Toolbar */
    .toolbar {
      width: 100%;
      background: var(--background-card);
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(8px);
    }

    .toolbar-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-4) 0;
      min-height: 80px;
    }

    /* Logo Section */
    .toolbar-left {
      display: flex;
      align-items: center;
    }

    .toolbar-logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      text-decoration: none;
      transition: all var(--transition-normal);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-2);
    }

    .toolbar-logo:hover {
      background: var(--background-elevated);
      transform: translateY(-1px);
    }

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--text-muted);
      line-height: 1;
      margin-top: -2px;
    }

    /* Wallet Section */
    .toolbar-right {
      display: flex;
      align-items: center;
    }

    /* Wallet Connected State */
    .wallet-connected {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .wallet-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--spacing-1);
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: var(--spacing-1_5);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: var(--success-green);
      border-radius: var(--border-radius-full);
      animation: pulse 2s infinite;
    }

    .status-text {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--text-success);
    }

    .wallet-address {
      font-family: var(--font-family-mono);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
      background: var(--background-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-1_5) var(--spacing-3);
      min-width: 100px;
      text-align: center;
      transition: all var(--transition-normal);
    }

    .wallet-address:hover {
      background: var(--background-accent);
      border-color: var(--primary-trust-blue-light);
      color: var(--primary-trust-blue);
    }

    /* Wallet Disconnected State */
    .wallet-disconnected {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--spacing-1);
    }

    .connect-btn {
      white-space: nowrap;
    }

    .connection-hint {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      text-align: right;
    }

    /* Button Styles - Following the design system */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2_5) var(--spacing-4);
      border-radius: var(--border-radius-md);
      border: 1px solid transparent;
      font-family: var(--font-family-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
      cursor: pointer;
      transition: all var(--transition-normal);
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--gradient-trust-blue);
      color: var(--text-inverse);
      border-color: var(--primary-trust-blue);
      box-shadow: var(--shadow-trust);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-trust-blue-dark);
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }

    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
      border-color: transparent;
    }

    .btn-ghost:hover:not(:disabled) {
      background: var(--background-elevated);
      color: var(--text-primary);
    }

    .btn:focus-visible {
      outline: 2px solid var(--border-focus);
      outline-offset: 2px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .toolbar-nav {
        padding: var(--spacing-3) 0;
        min-height: 70px;
      }

      .brand-name {
        font-size: var(--font-size-lg);
      }

      .brand-subtitle {
        display: none;
      }

      .wallet-info {
        align-items: center;
      }

      .connection-status {
        display: none;
      }

      .wallet-address {
        font-size: var(--font-size-xs);
        min-width: 80px;
        padding: var(--spacing-1) var(--spacing-2);
      }

      .btn-text {
        display: none;
      }

      .btn {
        padding: var(--spacing-2);
        min-width: auto;
      }

      .connection-hint {
        display: none;
      }

      .wallet-connected {
        gap: var(--spacing-2);
      }
    }

    @media (max-width: 480px) {
      .container {
        padding: 0 var(--spacing-3);
      }

      .toolbar-logo {
        gap: var(--spacing-2);
        padding: var(--spacing-1);
      }

      .logo-icon svg {
        width: 32px;
        height: 32px;
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .toolbar {
        border-bottom-width: 2px;
      }

      .trust-badge {
        border-width: 2px;
      }

      .btn {
        border-width: 2px;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .toolbar-logo,
      .wallet-address,
      .btn {
        transition: none;
      }

      .status-dot {
        animation: none;
      }
    }
  `]
})
export class ToolbarComponent {
  walletService = inject(WalletService);

  connect() {
    this.walletService.signIn();
  }

  disconnect() {
    this.walletService.signOut();
  }
} 