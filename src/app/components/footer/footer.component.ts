import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <footer class="footer" role="contentinfo">
      <div class="container">
        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="footer-info">
            <div class="brand-logo">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <circle cx="24" cy="24" r="24" fill="url(#footerLogoGradient)"/>
                <path d="M24 8C15.2 8 8 15.2 8 24C8 32.8 15.2 40 24 40C32.8 40 40 32.8 40 24C40 15.2 32.8 8 24 8ZM24 36C17.4 36 12 30.6 12 24C12 17.4 17.4 12 24 12C30.6 12 36 17.4 36 24C36 30.6 30.6 36 24 36Z" fill="white"/>
                <path d="M24 16C19.6 16 16 19.6 16 24C16 28.4 19.6 32 24 32C28.4 32 32 28.4 32 24C32 19.6 28.4 16 24 16ZM24 28C21.8 28 20 26.2 20 24C20 21.8 21.8 20 24 20C26.2 20 28 21.8 28 24C28 26.2 26.2 28 24 28Z" fill="white"/>
              </svg>
              <div class="brand-text">
                <span class="brand-name">B2Pix</span>
                <span class="brand-tagline">P2P Bitcoin com PIX</span>
              </div>
            </div>
            <div class="footer-legal">
              <p class="copyright">
                © {{ currentYear }} B2Pix. Todos os direitos reservados.
              </p>
              <p class="disclaimer">
                Bitcoin é um ativo volátil. Invista com responsabilidade.
              </p>
            </div>
          </div>
          
          <div class="footer-social">
            <span class="social-label">Siga-nos:</span>
            <div class="social-links">
              <a href="#" target="_blank" aria-label="Telegram" class="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 2L3 8.5L10 13L15 20L21 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13 13L21 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              <a href="#" target="_blank" aria-label="Twitter" class="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              <a href="#" target="_blank" aria-label="Discord" class="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- SVG Definitions -->
      <svg width="0" height="0">
        <defs>
          <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:var(--primary-bitcoin-orange)"/>
            <stop offset="100%" style="stop-color:var(--primary-bitcoin-orange-light)"/>
          </linearGradient>
        </defs>
      </svg>
    </footer>
  `,
  styles: [`
    /* Global text selection fix for footer */
    .footer ::selection {
      background: var(--primary-trust-blue-light);
      color: var(--text-inverse);
    }

    .footer ::-moz-selection {
      background: var(--primary-trust-blue-light);
      color: var(--text-inverse);
    }

    /* Container */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--spacing-4);
    }

    /* Footer */
    .footer {
      background: var(--gradient-subtle);
      border-top: 1px solid var(--border-color);
      margin-top: auto;
    }

    /* Footer Bottom */
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-8) 0;
    }

    .footer-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-6);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
      line-height: 1.2;
    }

    .brand-tagline {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--text-muted);
      line-height: 1;
      margin-top: -2px;
    }

    .footer-legal {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .copyright {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin: 0;
    }

    .disclaimer {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      margin: 0;
    }

    .footer-social {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
    }

    .social-label {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }

    .social-links {
      display: flex;
      gap: var(--spacing-2);
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: var(--background-elevated);
      color: var(--text-secondary);
      border-radius: var(--border-radius-md);
      transition: all var(--transition-normal);
      text-decoration: none;
    }

    .social-link:hover {
      background: var(--primary-trust-blue);
      color: var(--text-inverse);
      transform: translateY(-1px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .footer-bottom {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-6);
        padding: var(--spacing-6) 0;
      }

      .footer-info {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-4);
      }

      .footer-social {
        align-self: stretch;
        justify-content: space-between;
      }
    }

    @media (max-width: 480px) {
      .container {
        padding: 0 var(--spacing-3);
      }

      .brand-logo {
        gap: var(--spacing-2);
      }

      .brand-logo svg {
        width: 28px;
        height: 28px;
      }

      .footer-info {
        gap: var(--spacing-3);
      }

      .social-links {
        gap: var(--spacing-1);
      }

      .social-link {
        width: 36px;
        height: 36px;
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .footer {
        border-top-width: 2px;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .social-link {
        transition: none;
      }

      .social-link:hover {
        transform: none;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}