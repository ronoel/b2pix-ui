import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WalletService } from '../../libs/wallet.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="toolbar" role="banner">
      <nav class="toolbar-nav" aria-label="Main toolbar">
        <div class="toolbar-left">
          <a class="toolbar-logo" routerLink="/" aria-label="B2Pix Home">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="24" r="24" fill="url(#logoGradient)"/>
              <path d="M24 8C15.2 8 8 15.2 8 24C8 32.8 15.2 40 24 40C32.8 40 40 32.8 40 24C40 15.2 32.8 8 24 8ZM24 36C17.4 36 12 30.6 12 24C12 17.4 17.4 12 24 12C30.6 12 36 17.4 36 24C36 30.6 30.6 36 24 36Z" fill="white"/>
              <path d="M24 16C19.6 16 16 19.6 16 24C16 28.4 19.6 32 24 32C28.4 32 32 28.4 32 24C32 19.6 28.4 16 24 16ZM24 28C21.8 28 20 26.2 20 24C20 21.8 21.8 20 24 20C26.2 20 28 21.8 28 24C28 26.2 26.2 28 24 28Z" fill="white"/>
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#F7931A"/>
                  <stop offset="100%" style="stop-color:#FFA726"/>
                </linearGradient>
              </defs>
            </svg>
            <span class="toolbar-title">B2Pix</span>
          </a>
        </div>
        <div class="toolbar-right">
          @if (walletService.isLoggedInSignal()) {
            <span class="wallet-address" title="{{ walletService.walletAddressSignal() }}">
              {{ walletService.walletAddressSignal() ? (walletService.walletAddressSignal() | slice:0:3 ) + '...' + (walletService.walletAddressSignal() | slice:-3 ) : '' }}
            </span>
            <button class="btn btn-outline" (click)="disconnect()" aria-label="Desconectar Wallet">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span class="btn-text">Desconectar</span>
            </button>
          } @else {
            <button class="btn btn-primary" (click)="connect()" aria-label="Conectar Wallet">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="btn-text">Conectar Wallet</span>
            </button>
          }
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .toolbar {
      width: 100%;
      background: var(--background-card);
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .toolbar-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--spacing-md) var(--spacing-xl);
    }
    .toolbar-left {
      display: flex;
      align-items: center;
    }
    .toolbar-logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      text-decoration: none;
    }
    .toolbar-title {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--text-primary);
      margin-left: var(--spacing-xs);
    }
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }
    .wallet-address {
      font-family: monospace;
      font-size: var(--font-size-md);
      color: var(--primary-blue);
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-xs) var(--spacing-md);
      margin-right: var(--spacing-md);
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-md);
      padding: var(--spacing-sm) var(--spacing-lg);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .btn-primary {
      background: var(--primary-orange);
      color: #fff;
      border: none;
    }
    .btn-outline {
      background: transparent;
      color: var(--primary-orange);
      border: 1px solid var(--primary-orange);
    }
    .btn:focus {
      outline: 2px solid var(--primary-blue);
      outline-offset: 2px;
    }
    @media (max-width: 768px) {
      .toolbar-nav {
        padding: var(--spacing-md);
      }
      .toolbar-title {
        font-size: var(--font-size-lg);
      }
      .wallet-address {
        max-width: 80px;
        font-size: var(--font-size-sm);
      }
      .btn-text {
        display: none;
      }
      .btn {
        padding: var(--spacing-sm);
        min-width: auto;
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