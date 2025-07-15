import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { WalletService } from '../../libs/wallet.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="landing-page">
      <div class="hero-section">
        <div class="container">
          <div class="hero-content">
            <!-- Logo -->
            <div class="logo-section">
              <div class="logo">
                <div class="logo-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="24" fill="url(#logoGradient)"/>
                    <path d="M24 8C15.2 8 8 15.2 8 24C8 32.8 15.2 40 24 40C32.8 40 40 32.8 40 24C40 15.2 32.8 8 24 8ZM24 36C17.4 36 12 30.6 12 24C12 17.4 17.4 12 24 12C30.6 12 36 17.4 36 24C36 30.6 30.6 36 24 36Z" fill="white"/>
                    <path d="M24 16C19.6 16 16 19.6 16 24C16 28.4 19.6 32 24 32C28.4 32 32 28.4 32 24C32 19.6 28.4 16 24 16ZM24 28C21.8 28 20 26.2 20 24C20 21.8 21.8 20 24 20C26.2 20 28 21.8 28 24C28 26.2 26.2 28 24 28Z" fill="white"/>
                  </svg>
                </div>
                <h1 class="logo-text">B2Pix</h1>
              </div>
              <p class="logo-subtitle">P2P Bitcoin com PIX</p>
            </div>

            <!-- Hero Text -->
            <div class="hero-text">
              <h2 class="hero-title">
                Compra e venda <span class="text-gradient">Bitcoin</span> com PIX
              </h2>
              <p class="hero-description">
                Plataforma P2P sem custódia, focada em privacidade e automação. 
                Acesso exclusivo por convite.
              </p>
            </div>

            <!-- Features -->
            <div class="features">
              <div class="feature">
                <div class="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span>Sem Custódia</span>
              </div>
              <div class="feature">
                <div class="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span>Automático</span>
              </div>
              <div class="feature">
                <div class="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <span>Segurança</span>
              </div>
            </div>

            <!-- CTA Button -->
            <div class="cta-section">
              <button class="btn btn-primary btn-large" (click)="connectWallet()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ walletService.isLoggedInSignal() ? 'Entrar' : 'Conectar Wallet' }}
              </button>
              <p class="cta-note">Acesso exclusivo por convite</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">$2.5M+</div>
              <div class="stat-label">Volume Total</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">1,200+</div>
              <div class="stat-label">Usuários Ativos</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">15,000+</div>
              <div class="stat-label">Transações</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">99.9%</div>
              <div class="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Background Elements -->
      <div class="bg-elements">
        <div class="bg-circle bg-circle-1"></div>
        <div class="bg-circle bg-circle-2"></div>
        <div class="bg-circle bg-circle-3"></div>
      </div>

      <!-- SVG Definitions -->
      <svg width="0" height="0">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#F7931A"/>
            <stop offset="100%" style="stop-color:#FFA726"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .hero-content {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
      padding: var(--spacing-2xl) 0;
    }

    /* Logo Section */
    .logo-section {
      margin-bottom: var(--spacing-2xl);
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-text {
      font-size: var(--font-size-4xl);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .logo-subtitle {
      font-size: var(--font-size-lg);
      color: var(--text-secondary);
      font-weight: 400;
      margin: 0;
    }

    /* Hero Text */
    .hero-text {
      margin-bottom: var(--spacing-2xl);
    }

    .hero-title {
      font-size: var(--font-size-4xl);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--spacing-lg);
      line-height: 1.2;
    }

    .hero-description {
      font-size: var(--font-size-lg);
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Features */
    .features {
      display: flex;
      justify-content: center;
      gap: var(--spacing-xl);
      margin-bottom: var(--spacing-2xl);
      flex-wrap: wrap;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      color: var(--text-secondary);
      font-weight: 500;
    }

    .feature-icon {
      color: var(--primary-orange);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* CTA Section */
    .cta-section {
      margin-bottom: var(--spacing-2xl);
    }

    .btn-large {
      padding: var(--spacing-lg) var(--spacing-2xl);
      font-size: var(--font-size-lg);
      font-weight: 600;
      min-width: 200px;
    }

    .cta-note {
      margin-top: var(--spacing-md);
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }

    /* Stats Section */
    .stats-section {
      padding: var(--spacing-2xl) 0;
      background: var(--background-card);
      border-top: 1px solid var(--border-color);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-lg);
    }

    .stat-card {
      text-align: center;
      padding: var(--spacing-lg);
    }

    .stat-number {
      font-size: var(--font-size-3xl);
      font-weight: 700;
      color: var(--primary-orange);
      margin-bottom: var(--spacing-sm);
    }

    .stat-label {
      font-size: var(--font-size-md);
      color: var(--text-secondary);
      font-weight: 500;
    }

    /* Background Elements */
    .bg-elements {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
    }

    .bg-circle {
      position: absolute;
      border-radius: 50%;
      background: var(--gradient-orange);
      opacity: 0.1;
      filter: blur(40px);
    }

    .bg-circle-1 {
      width: 300px;
      height: 300px;
      top: 10%;
      left: 10%;
      animation: float 6s ease-in-out infinite;
    }

    .bg-circle-2 {
      width: 200px;
      height: 200px;
      top: 60%;
      right: 15%;
      background: var(--gradient-blue);
      animation: float 8s ease-in-out infinite reverse;
    }

    .bg-circle-3 {
      width: 150px;
      height: 150px;
      bottom: 20%;
      left: 20%;
      background: var(--gradient-orange);
      animation: float 7s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    /* Responsividade */
    @media (max-width: 768px) {
      .hero-content {
        padding: var(--spacing-xl) 0;
      }

      .logo-text {
        font-size: var(--font-size-3xl);
      }

      .hero-title {
        font-size: var(--font-size-3xl);
      }

      .hero-description {
        font-size: var(--font-size-md);
      }

      .features {
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-md);
      }

      .feature {
        width: 100%;
        max-width: 300px;
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);
      }

      .stat-card {
        padding: var(--spacing-md);
      }

      .stat-number {
        font-size: var(--font-size-2xl);
      }

      .bg-circle-1 {
        width: 200px;
        height: 200px;
      }

      .bg-circle-2 {
        width: 150px;
        height: 150px;
      }

      .bg-circle-3 {
        width: 100px;
        height: 100px;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .logo {
        flex-direction: column;
        gap: var(--spacing-sm);
      }

      .btn-large {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class LandingComponent {
  private router = inject(Router);
  private userService = inject(UserService);
  walletService = inject(WalletService);

  connectWallet() {
    if (!this.walletService.isLoggedInSignal()) {
      this.walletService.signIn();
    }
  }
}
