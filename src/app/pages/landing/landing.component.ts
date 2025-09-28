import { Component, inject, effect, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WalletService } from '../../libs/wallet.service';
import { InvitesService } from '../../shared/api/invites.service';

@Component({
  selector: 'app-landing',
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
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
                Compre e venda <span class="text-gradient">Bitcoin</span> com PIX
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
              @if(walletService.isLoggedInSignal()) {
                <button class="btn btn-primary btn-large" (click)="accessDashboard()">
                  Entrar
                </button>

                <button class="btn btn-secondary btn-large" (click)="testSentInvitePayload()">
                  Teste
                </button>
              } @else {
                <button class="btn btn-primary btn-large" (click)="connectWallet()">
                  Conectar Wallet
                </button>
              }
              
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

      <!-- Trust Section -->
      <div class="trust-section">
        <div class="container">
          <h3 class="trust-title">Por que escolher B2Pix?</h3>
          <div class="trust-indicators">
            <div class="trust-badge">
              <div class="trust-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
                </svg>
              </div>
              <div class="trust-content">
                <h4 class="trust-name">Compra Segura</h4>
                <p class="trust-description">Transações protegidas com smart contracts</p>
              </div>
            </div>

            <div class="trust-badge">
              <div class="trust-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="trust-content">
                <h4 class="trust-name">Pagamento PIX</h4>
                <p class="trust-description">Transferências instantâneas e automáticas</p>
              </div>
            </div>

            <div class="trust-badge">
              <div class="trust-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="trust-content">
                <h4 class="trust-name">Sem Custódia</h4>
                <p class="trust-description">Você mantém controle total dos seus Bitcoins</p>
              </div>
            </div>

            <div class="trust-badge">
              <div class="trust-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="trust-content">
                <h4 class="trust-name">Automático</h4>
                <p class="trust-description">Processo automatizado do início ao fim</p>
              </div>
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
    /* Global text selection fix */
    .landing-page ::selection {
      background: #3B82F6;
      color: #FFFFFF;
    }

    .landing-page ::-moz-selection {
      background: #3B82F6;
      color: #FFFFFF;
    }

    /* Container */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
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
      transform: translateY(-1px);
      box-shadow: 0 4px 12px 0 rgb(30 64 175 / 0.4);
    }

    .btn-secondary {
      background: #6B7280;
      color: white;
      border-color: #6B7280;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #4B5563;
      transform: translateY(-1px);
    }

    .btn-large {
      padding: 16px 32px;
      font-size: 16px;
      min-width: 200px;
    }

    .landing-page {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
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
      padding: 48px 0;
    }

    /* Logo Section */
    .logo-section {
      margin-bottom: 48px;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-text {
      font-size: 36px;
      font-weight: 700;
      color: #1F2937;
      margin: 0;
    }

    .logo-subtitle {
      font-size: 18px;
      color: #6B7280;
      font-weight: 400;
      margin: 0;
    }

    .text-gradient {
      background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Hero Text */
    .hero-text {
      margin-bottom: 48px;
    }

    .hero-title {
      font-size: 36px;
      font-weight: 700;
      color: #1F2937;
      margin-bottom: 24px;
      line-height: 1.2;
    }

    .hero-description {
      font-size: 18px;
      color: #6B7280;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Features */
    .features {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-bottom: 48px;
      flex-wrap: wrap;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      color: #6B7280;
      font-weight: 500;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
      transition: all 0.2s ease;
    }

    .feature:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px 0 rgb(0 0 0 / 0.15);
      border-color: #3B82F6;
    }

    .feature-icon {
      color: #F59E0B;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* CTA Section */
    .cta-section {
      margin-bottom: 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .cta-note {
      margin-top: 16px;
      color: #9CA3AF;
      font-size: 14px;
    }

    /* Stats Section */
    .stats-section {
      padding: 48px 0;
      background: #FFFFFF;
      border-top: 1px solid #E5E7EB;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .stat-card {
      text-align: center;
      padding: 24px;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-number {
      font-size: 30px;
      font-weight: 700;
      color: #F59E0B;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      font-size: 16px;
      color: #6B7280;
      font-weight: 500;
    }

    /* Trust Section */
    .trust-section {
      padding: 48px 0;
      background: #FFFFFF;
      border-top: 1px solid #E5E7EB;
    }

    .trust-title {
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      color: #1F2937;
      margin: 0 0 48px 0;
    }

    .trust-indicators {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .trust-badge {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 24px;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 12px;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .trust-badge:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      border-color: #3B82F6;
    }

    .trust-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: #ECFDF5;
      color: #059669;
      border-radius: 16px;
      flex-shrink: 0;
    }

    .trust-content {
      flex: 1;
    }

    .trust-name {
      font-size: 18px;
      font-weight: 600;
      color: #1F2937;
      margin: 0 0 6px 0;
    }

    .trust-description {
      font-size: 14px;
      color: #6B7280;
      margin: 0;
      line-height: 1.6;
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
      background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
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
      background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
      animation: float 8s ease-in-out infinite reverse;
    }

    .bg-circle-3 {
      width: 150px;
      height: 150px;
      bottom: 20%;
      left: 20%;
      background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
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

    /* Responsive Design */
    @media (max-width: 768px) {
      .container {
        padding: 0 12px;
      }

      .hero-content {
        padding: 32px 0;
      }

      .logo-text {
        font-size: 30px;
      }

      .hero-title {
        font-size: 30px;
      }

      .hero-description {
        font-size: 16px;
      }

      .features {
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }

      .feature {
        width: 100%;
        max-width: 300px;
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .trust-indicators {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .trust-badge {
        padding: 16px;
      }

      .trust-icon {
        width: 40px;
        height: 40px;
      }

      .stat-card {
        padding: 16px;
      }

      .stat-number {
        font-size: 24px;
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

      .trust-section {
        padding: 32px 0;
      }

      .trust-title {
        font-size: 20px;
        margin-bottom: 32px;
      }

      .trust-indicators {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .logo {
        flex-direction: column;
        gap: 12px;
      }

      .btn-large {
        width: 100%;
        max-width: 300px;
      }

      .cta-section {
        flex-direction: column;
        gap: 12px;
      }
    }
  `]
})
export class LandingComponent {
  private router = inject(Router);
  walletService = inject(WalletService);
  private invitesService = inject(InvitesService);
  private connectWalletClicked = false;
  public isLoggedIn = this.walletService.isLoggedInSignal();

  constructor() {
    effect(() => {
      // Only redirect if user just connected wallet and has a claimed invite
      if (this.walletService.isLoggedInSignal() && this.connectWalletClicked) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  accessDashboard() {
    this.router.navigate(['/dashboard']);
  }

  connectWallet() {
    if (!this.walletService.isLoggedInSignal()) {
      this.connectWalletClicked = true;
      this.walletService.signIn();
    }
  }

  testSentInvitePayload() {
    this.invitesService.sendInvite("ronoeljr@gmail.com").subscribe({
      next: (response) => {
        console.log('Invite sent successfully:', response);
      },
      error: (error) => {
        console.error('Error sending invite:', error);
      }
    });
  }
}
