import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingService } from '../../services/loading.service';

interface BankCredentials {
  clientId: string;
  clientSecret: string;
  certificateFile: File | null;
}

@Component({
  selector: 'app-bank-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bank-setup">
      <!-- Step Indicator -->
      <div class="steps-indicator">
        <div class="step" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">
          <div class="step-circle">1</div>
          <span>Configurar Credenciais</span>
        </div>
        <div class="step-line" [class.completed]="currentStep > 1"></div>
        <div class="step" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">
          <div class="step-circle">2</div>
          <span>Certificado</span>
        </div>
        <div class="step-line" [class.completed]="currentStep > 2"></div>
        <div class="step" [class.active]="currentStep === 3">
          <div class="step-circle">3</div>
          <span>Finalizar</span>
        </div>
      </div>

      <!-- Step 1: API Configuration -->
      @if (currentStep === 1) {
        <div class="step-content">
          <div class="step-header">
            <div class="step-icon api-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2>Configurar Credenciais da API PIX</h2>
            <p>Configure a API PIX no aplicativo web do Banco EFI</p>
          </div>

          <div class="warning-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18C1.64 18.37 1.9 18.8 2.32 18.8H21.68C22.1 18.8 22.36 18.37 22.18 18L13.71 3.86C13.53 3.49 13.07 3.49 12.89 3.86L10.29 3.86Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div>
              <strong>Importante:</strong> Acesse o aplicativo pelo computador/navegador, não pelo celular.
            </div>
          </div>

          <div class="instructions-list">
            <div class="instruction-item">
              <div class="instruction-number">1</div>
              <div class="instruction-content">
                <h4>Acesse o app pelo navegador</h4>
                <p>Entre na sua conta EFI usando o navegador do computador</p>
                <button class="btn btn-primary btn-large" (click)="openBankApp()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 13V6C18 5.46957 17.7893 4.96086 17.4142 4.58579C17.0391 4.21071 16.5304 4 16 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H16C16.5304 20 17.0391 19.7893 17.4142 19.4142C17.7893 19.0391 18 18.5304 18 18V13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 10V6C22 5.46957 21.7893 4.96086 21.4142 4.58579C21.0391 4.21071 20.5304 4 20 4H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Abrir App EFI
                </button>
              </div>
            </div>
            
            <div class="instruction-item">
              <div class="instruction-number">2</div>
              <div class="instruction-content">
                <h4>Vá para o menu "API"</h4>
                <p>No menu principal, clique em "API"</p>
              </div>
            </div>

            <div class="instruction-item">
              <div class="instruction-number">3</div>
              <div class="instruction-content">
                <h4>Criar nova aplicação</h4>
                <p>Vá em <strong>Aplicações → Criar Aplicação</strong></p>
                <p>Nome da aplicação: <span class="highlight">B2PIX</span></p>
              </div>
            </div>

            <div class="instruction-item">
              <div class="instruction-number">4</div>
              <div class="instruction-content">
                <h4>Configurar permissões da API PIX</h4>
                <p>Selecione os itens nas colunas "Produção" e "Homologação":</p>
                <ul class="permissions-list">
                  <li>✓ Consultar Pix</li>
                  <li>✓ Alterar Chaves aleatórias</li>
                  <li>✓ Consultar Chaves aleatórias</li>
                </ul>
              </div>
            </div>

            <div class="instruction-item">
              <div class="instruction-number">5</div>
              <div class="instruction-content">
                <h4>Autorizar e obter credenciais</h4>
                <p>Clique em "Continuar" e confirme com sua assinatura eletrônica</p>
              </div>
            </div>
          </div>

          <div class="credentials-section">
            <h3>Credenciais Geradas</h3>
            <p>Após seguir os passos acima, copie e cole as credenciais abaixo:</p>
            
            <form>
              <div class="form-group">
                <label for="clientId">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Chave Client ID
                </label>
                <textarea
                  id="clientId"
                  [(ngModel)]="credentials.clientId"
                  name="clientId"
                  placeholder="Cole aqui sua Chave Client ID"
                  class="form-input credential-input"
                  rows="3"
                  required></textarea>
              </div>

              <div class="form-group">
                <label for="clientSecret">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Chave Secret
                </label>
                <textarea
                  id="clientSecret"
                  [(ngModel)]="credentials.clientSecret"
                  name="clientSecret"
                  placeholder="Cole aqui sua Chave Secret"
                  class="form-input credential-input"
                  rows="3"
                  required></textarea>
              </div>
            </form>
          </div>

          <div class="step-actions">
            <button class="btn btn-outline" (click)="previousStep()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Voltar
            </button>
            <button 
              class="btn btn-primary" 
              (click)="nextStep()"
              [disabled]="!credentials.clientId || !credentials.clientSecret">
              Continuar
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      }

      <!-- Step 2: Certificate -->
      @if (currentStep === 2) {
        <div class="step-content">
          <div class="step-header">
            <div class="step-icon cert-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 13V8H8V18H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2>Criar e Baixar Certificado</h2>
            <p>Agora você precisa criar um certificado para autenticação segura</p>
          </div>

          <div class="instructions-list">
            <div class="instruction-item">
              <div class="instruction-number">1</div>
              <div class="instruction-content">
                <h4>Criar certificado no app web</h4>
                <p>No app EFI, clique em <strong>"Criar Certificado"</strong></p>
              </div>
            </div>

            <div class="instruction-item">
              <div class="instruction-number">2</div>
              <div class="instruction-content">
                <h4>Novo certificado</h4>
                <p>Clique em <strong>"Criar Novo Certificado"</strong></p>
                <p>Nome do certificado: <span class="highlight">B2PIX</span></p>
                <p>Clique em <strong>"CRIAR"</strong></p>
              </div>
            </div>

            <div class="instruction-item">
              <div class="instruction-number">3</div>
              <div class="instruction-content">
                <h4>Autenticar no celular</h4>
                <p>No aplicativo do seu <strong>celular</strong>, vá no menu (ícone superior esquerdo)</p>
                <p>Selecione o primeiro ícone <strong>"Autenticador"</strong></p>
              </div>
            </div>

            <div class="instruction-item">
              <div class="instruction-number">4</div>
              <div class="instruction-content">
                <h4>Baixar certificado</h4>
                <p>Após autenticar pelo celular, baixe o arquivo do certificado</p>
              </div>
            </div>
          </div>

          <div class="upload-section">
            <h3>Upload do Certificado</h3>
            <p>Faça upload do arquivo de certificado que você baixou:</p>
            
            <div class="file-upload-area" [class.has-file]="credentials.certificateFile">
              <input 
                type="file" 
                id="certificate" 
                accept=".p12,.pem,.crt"
                (change)="onCertificateSelected($event)"
                hidden>
              <label for="certificate" class="upload-zone">
                @if (credentials.certificateFile) {
                  <div class="file-info">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div class="file-details">
                      <div class="file-name">{{ credentials.certificateFile.name }}</div>
                      <div class="file-size">{{ formatFileSize(credentials.certificateFile.size) }}</div>
                    </div>
                  </div>
                  <button type="button" class="change-file-btn">Alterar arquivo</button>
                } @else {
                  <div class="upload-prompt">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h4>Clique para selecionar o certificado</h4>
                    <p>Arquivos aceitos: .p12, .pem, .crt</p>
                  </div>
                }
              </label>
            </div>
          </div>

          <div class="step-actions">
            <button class="btn btn-outline" (click)="previousStep()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Voltar
            </button>
            <button 
              class="btn btn-primary" 
              (click)="nextStep()"
              [disabled]="!credentials.certificateFile">
              Continuar
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      }

      <!-- Step 3: Review and Submit -->
      @if (currentStep === 3) {
        <div class="step-content">
          <div class="step-header">
            <div class="step-icon success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 20.5304 3 20V9C3 8.46957 3.21071 7.96086 3.58579 7.58579C3.96086 7.21071 4.46957 7 5 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2>Revisar Configuração</h2>
            <p>Confirme se todos os dados estão corretos antes de finalizar</p>
          </div>

          <div class="review-section">
            <div class="review-item">
              <div class="review-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2"/>
                </svg>
                Client ID
              </div>
              <div class="review-value">{{ maskCredential(credentials.clientId) }}</div>
            </div>

            <div class="review-item">
              <div class="review-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
                </svg>
                Client Secret
              </div>
              <div class="review-value">{{ maskCredential(credentials.clientSecret) }}</div>
            </div>

            <div class="review-item">
              <div class="review-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Certificado
              </div>
              <div class="review-value">{{ credentials.certificateFile?.name }}</div>
            </div>
          </div>

          <div class="final-actions">
            <button class="btn btn-outline" (click)="previousStep()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Voltar
            </button>
            <button 
              class="btn btn-primary btn-large" 
              (click)="submitCredentials()"
              [disabled]="loadingService.getIsLoading()()">
              @if (loadingService.getIsLoading()()) {
                <div class="btn-loading"></div>
                Configurando...
              } @else {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 20.5304 3 20V9C3 8.46957 3.21071 7.96086 3.58579 7.58579C3.96086 7.21071 4.46957 7 5 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Finalizar Configuração
              }
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .bank-setup {
      max-width: 800px;
      margin: 0 auto;
    }

    .steps-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--spacing-3xl);
      padding: var(--spacing-lg);
      background: var(--background-card);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--border-color);
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      transition: color var(--transition-normal);
    }

    .step.active {
      color: var(--primary-orange);
    }

    .step.completed {
      color: var(--success-green);
    }

    .step-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--background-elevated);
      border: 2px solid var(--border-color);
      font-weight: 600;
      transition: all var(--transition-normal);
    }

    .step.active .step-circle {
      background: var(--primary-orange);
      border-color: var(--primary-orange);
      color: white;
    }

    .step.completed .step-circle {
      background: var(--success-green);
      border-color: var(--success-green);
      color: white;
    }

    .step-line {
      flex: 1;
      height: 2px;
      background: var(--border-color);
      margin: 0 var(--spacing-md);
      transition: background var(--transition-normal);
    }

    .step-line.completed {
      background: var(--success-green);
    }

    .step-content {
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-2xl);
    }

    .step-header {
      text-align: center;
      margin-bottom: var(--spacing-2xl);
    }

    .step-icon {
      margin-bottom: var(--spacing-lg);
    }

    .bank-icon {
      color: var(--primary-blue);
    }

    .api-icon {
      color: var(--primary-orange);
    }

    .cert-icon {
      color: var(--primary-purple);
    }

    .success-icon {
      color: var(--success-green);
    }

    .step-header h2 {
      font-size: var(--font-size-2xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .step-header p {
      color: var(--text-secondary);
      margin: 0;
      font-size: var(--font-size-md);
    }

    .warning-box {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background: var(--warning-yellow-bg);
      border: 1px solid var(--warning-yellow);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-lg);
      color: var(--warning-yellow-text);
    }

    .instructions-list {
      margin-bottom: var(--spacing-2xl);
    }

    .instruction-item {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-md);
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
    }

    .instruction-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: var(--primary-orange);
      color: white;
      border-radius: 50%;
      font-weight: 600;
      font-size: var(--font-size-sm);
      flex-shrink: 0;
    }

    .instruction-content {
      flex: 1;
    }

    .instruction-content h4 {
      font-size: var(--font-size-md);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .instruction-content p {
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-sm) 0;
      line-height: 1.5;
    }

    .instruction-content p:last-child {
      margin-bottom: 0;
    }

    .highlight {
      background: var(--primary-orange-bg);
      color: var(--primary-orange);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    .permissions-list {
      margin: var(--spacing-sm) 0 0 0;
      padding: 0;
      list-style: none;
    }

    .permissions-list li {
      color: var(--success-green);
      font-weight: 500;
      margin-bottom: var(--spacing-xs);
    }

    .credentials-section,
    .upload-section,
    .review-section {
      padding: var(--spacing-lg);
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-lg);
    }

    .credentials-section h3,
    .upload-section h3 {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .credentials-section p,
    .upload-section p {
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-lg) 0;
    }

    .form-group {
      margin-bottom: var(--spacing-lg);
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .credential-input {
      width: 100%;
      padding: var(--spacing-md);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      color: var(--text-primary);
      font-size: var(--font-size-sm);
      font-family: 'Courier New', monospace;
      resize: vertical;
      min-height: 80px;
      transition: border-color var(--transition-normal);
    }

    .credential-input:focus {
      border-color: var(--primary-orange);
      outline: none;
    }

    .file-upload-area {
      border: 2px dashed var(--border-color);
      border-radius: var(--border-radius-md);
      transition: all var(--transition-normal);
    }

    .file-upload-area.has-file {
      border-color: var(--success-green);
      background: var(--success-green-bg);
    }

    .upload-zone {
      display: block;
      padding: var(--spacing-2xl);
      text-align: center;
      cursor: pointer;
      transition: background var(--transition-normal);
    }

    .upload-zone:hover {
      background: var(--background-elevated);
    }

    .upload-prompt {
      color: var(--text-secondary);
    }

    .upload-prompt svg {
      color: var(--text-muted);
      margin-bottom: var(--spacing-md);
    }

    .upload-prompt h4 {
      font-size: var(--font-size-md);
      font-weight: 500;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .upload-prompt p {
      font-size: var(--font-size-sm);
      margin: 0;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .file-info svg {
      color: var(--success-green);
    }

    .file-details {
      flex: 1;
      text-align: left;
    }

    .file-name {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .file-size {
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }

    .change-file-btn {
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--primary-orange);
      color: white;
      border: none;
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: background var(--transition-normal);
    }

    .change-file-btn:hover {
      background: var(--primary-orange-dark);
    }

    .review-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid var(--border-color);
    }

    .review-item:last-child {
      border-bottom: none;
    }

    .review-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .review-value {
      color: var(--text-primary);
      font-weight: 500;
      font-family: 'Courier New', monospace;
      font-size: var(--font-size-sm);
    }

    .step-actions,
    .final-actions {
      display: flex;
      justify-content: space-between;
      gap: var(--spacing-md);
      margin-top: var(--spacing-2xl);
    }

    .btn-large {
      padding: var(--spacing-md) var(--spacing-xl);
      font-size: var(--font-size-md);
    }

    .btn-sm {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-xs);
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

    @media (max-width: 768px) {
      .steps-indicator {
        padding: var(--spacing-md);
      }

      .step {
        font-size: var(--font-size-2xs);
      }

      .step-circle {
        width: 28px;
        height: 28px;
        font-size: var(--font-size-xs);
      }

      .step-content {
        padding: var(--spacing-lg);
      }

      .instruction-item {
        flex-direction: column;
        gap: var(--spacing-sm);
      }

      .instruction-number {
        align-self: flex-start;
      }

      .step-actions,
      .final-actions {
        flex-direction: column;
      }
    }
  `]
})
export class BankSetupComponent {
  protected loadingService = inject(LoadingService);

  currentStep = 1;
  credentials: BankCredentials = {
    clientId: '',
    clientSecret: '',
    certificateFile: null
  };

  @Output() setupComplete = new EventEmitter<BankCredentials>();
  @Output() setupCancelled = new EventEmitter<void>();

  openBankApp() {
    window.open('https://sejaefi.com.br/', '_blank');
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      // Se estamos na primeira etapa, emite o evento para cancelar o setup
      this.setupCancelled.emit();
    }
  }

  onCertificateSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.credentials.certificateFile = file;
    }
  }

  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  maskCredential(credential: string): string {
    if (!credential) return '';
    if (credential.length <= 8) return '*'.repeat(credential.length);
    return credential.substring(0, 4) + '*'.repeat(credential.length - 8) + credential.substring(credential.length - 4);
  }

  submitCredentials() {
    this.setupComplete.emit(this.credentials);
  }
}

