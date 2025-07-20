import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { LoadingService } from '../../services/loading.service';
import { BankSetupComponent } from '../../components/bank-setup/bank-setup.component';

@Component({
  selector: 'app-pix-account',
  standalone: true,
  imports: [CommonModule, FormsModule, BankSetupComponent],
  template: `
    <div class="pix-page">
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
            <h1 class="page-title">Conta PIX</h1>
            <p class="page-subtitle">Configure sua conta para receber pagamentos</p>
          </div>
        </div>

        @if (!hasExistingAccount && !showForm && !showBankSetup) {
          <!-- Setup Instructions -->
          <div class="setup-section">
            <div class="instructions-card">
              <div class="instructions-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              
              <div class="instructions-content">
                <h2>Configurar Conta PIX</h2>
                <p>Para receber pagamentos por suas vendas de Bitcoin, você precisa configurar uma conta PIX.</p>
                
                <div class="steps-grid">
                  <div class="step-card">
                    <div class="step-header">
                      <div class="step-number">1</div>
                      <div class="step-content">
                        <h3>Conta Bancária</h3>
                        <p>Crie uma conta gratuita no Banco EFI</p>
                      </div>
                    </div>
                    <button class="btn btn-primary step-btn" (click)="openBankAccount()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 13V6C18 5.46957 17.7893 4.96086 17.4142 4.58579C17.0391 4.21071 16.5304 4 16 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H16C16.5304 20 17.0391 19.7893 17.4142 19.4142C17.7893 19.0391 18 18.5304 18 18V13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22 10V6C22 5.46957 21.7893 4.96086 21.4142 4.58579C21.0391 4.21071 20.5304 4 20 4H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Abrir Conta
                    </button>
                  </div>
                  
                  <div class="step-card">
                    <div class="step-header">
                      <div class="step-number">2</div>
                      <div class="step-content">
                        <h3>Configuração do PIX</h3>
                        <p>Configure sua conta para receber pagamentos via PIX</p>
                      </div>
                    </div>
                    <button class="btn btn-primary step-btn" (click)="startBankSetup()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      Configurar Conta
                    </button>
                  </div>
                  
                  <div class="step-card">
                    <div class="step-header">
                      <div class="step-number">3</div>
                      <div class="step-content">
                        <h3>Anuncie seu Bitcoin</h3>
                        <p>Crie anúncios para vender Bitcoin e receber o dinheiro na sua conta</p>
                      </div>
                    </div>
                    <button class="btn btn-primary step-btn" (click)="createAd()" [disabled]="!pixConfigured">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Criar Anúncio
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } @else if (showBankSetup) {
          <!-- Bank Setup Component -->
          <app-bank-setup 
            (setupComplete)="onBankSetupComplete($event)"
            (setupCancelled)="onBankSetupCancelled()">
          </app-bank-setup>
        } @else if (showForm && !accountCreated) {
          <!-- Setup Form -->
          <div class="form-section">
            <div class="form-card">
              <div class="form-header">
                <h2>Configuração da Chave PIX</h2>
                <p>Configure sua chave PIX para receber pagamentos</p>
              </div>

              <form (ngSubmit)="onSubmit()" #form="ngForm">
                <div class="form-group">
                  <label for="bankName">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Banco
                  </label>
                  <input
                    id="bankName"
                    type="text"
                    [(ngModel)]="accountData.bankName"
                    name="bankName"
                    value="Banco EFI"
                    readonly
                    class="form-input readonly">
                </div>

                <div class="form-group">
                  <label for="accountNumber">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Número da Conta
                  </label>
                  <input
                    id="accountNumber"
                    type="text"
                    [(ngModel)]="accountData.accountNumber"
                    name="accountNumber"
                    required
                    placeholder="Ex: 12345-6"
                    class="form-input"
                    #accountNumber="ngModel">
                  @if (accountNumber.invalid && accountNumber.touched) {
                    <div class="error-message">Número da conta é obrigatório</div>
                  }
                </div>

                <div class="form-group">
                  <label for="pixKeyType">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Tipo de Chave PIX
                  </label>
                  <select 
                    id="pixKeyType"
                    [(ngModel)]="pixKeyType" 
                    name="pixKeyType"
                    (change)="onPixKeyTypeChange()"
                    class="form-input">
                    <option value="email">Email</option>
                    <option value="phone">Telefone</option>
                    <option value="cpf">CPF</option>
                    <option value="random">Chave Aleatória</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="pixKey">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M16.5 9.4L7.55 4.24C7.21 4.09 6.81 4.23 6.61 4.55L1.04 12L6.61 19.45C6.81 19.77 7.21 19.91 7.55 19.76L16.5 14.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <polyline points="10.5,15.5 15.5,12 10.5,8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Chave PIX
                  </label>
                  <input
                    id="pixKey"
                    type="text"
                    [(ngModel)]="accountData.pixKey"
                    name="pixKey"
                    required
                    [placeholder]="getPixKeyPlaceholder()"
                    class="form-input"
                    #pixKey="ngModel">
                  @if (pixKey.invalid && pixKey.touched) {
                    <div class="error-message">Chave PIX é obrigatória</div>
                  }
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="goBack()">
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary"
                    [disabled]="form.invalid || loadingService.getIsLoading()()">
                    @if (loadingService.getIsLoading()()) {
                      <div class="btn-loading"></div>
                      Validando...
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 20.5304 3 20V9C3 8.46957 3.21071 7.96086 3.58579 7.58579C3.96086 7.21071 4.46957 7 5 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Configurar Chave PIX
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        } @else if (accountCreated) {
          <!-- Success/Error Section -->
          <div class="result-section">
            @if (validationSuccess) {
              <div class="success-card">
                <div class="success-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 20.5304 3 20V9C3 8.46957 3.21071 7.96086 3.58579 7.58579C3.96086 7.21071 4.46957 7 5 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="success-content">
                  <h3>Conta configurada com sucesso!</h3>
                  <p>Sua conta PIX foi validada e está pronta para receber pagamentos.</p>
                  
                  <div class="account-summary">
                    <h4>Dados confirmados:</h4>
                    <div class="summary-grid">
                      <div class="summary-item">
                        <div class="summary-label">Banco</div>
                        <div class="summary-value">{{ accountData.bankName }}</div>
                      </div>
                      <div class="summary-item">
                        <div class="summary-label">Conta</div>
                        <div class="summary-value">{{ accountData.accountNumber }}</div>
                      </div>
                      <div class="summary-item">
                        <div class="summary-label">Chave PIX</div>
                        <div class="summary-value">{{ accountData.pixKey }}</div>
                      </div>
                    </div>
                  </div>

                  <button class="btn btn-primary" (click)="goToDashboard()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Ir para Dashboard
                  </button>
                </div>
              </div>
            } @else {
              <div class="error-card">
                <div class="error-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="error-content">
                  <h3>Erro na validação</h3>
                  <p>Não foi possível validar seus dados. Verifique as informações e tente novamente.</p>
                  
                  <div class="error-details">
                    <h4>Possíveis causas:</h4>
                    <ul>
                      <li>Dados da conta incorretos</li>
                      <li>Chave PIX não encontrada</li>
                      <li>Comprovante ilegível</li>
                    </ul>
                  </div>

                  <button class="btn btn-primary" (click)="retrySetup()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 12C3 7.02944 7.02944 3 12 3C14.5755 3 16.9 4.15205 18.5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C9.42446 21 7.09995 19.848 5.5 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M13 2L18 6L14 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M11 22L6 18L10 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Tentar Novamente
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Existing Account -->
          <div class="existing-section">
            <div class="existing-card">
              <div class="existing-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 20.5304 3 20V9C3 8.46957 3.21071 7.96086 3.58579 7.58579C3.96086 7.21071 4.46957 7 5 7H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              
              <div class="existing-content">
                <h3>Conta PIX Configurada</h3>
                <p>Sua conta está pronta para receber pagamentos</p>
                
                <div class="account-details">
                  <div class="detail-item">
                    <div class="detail-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Banco
                    </div>
                    <div class="detail-value">{{ existingAccount?.bankName }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Conta
                    </div>
                    <div class="detail-value">{{ existingAccount?.accountNumber }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Chave PIX
                    </div>
                    <div class="detail-value">{{ existingAccount?.pixKey }}</div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Status
                    </div>
                    <div class="detail-value verified">Verificada</div>
                  </div>
                </div>

                <div class="action-buttons">
                  <button class="btn btn-outline" (click)="editAccount()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H16C16.5304 20 17.0391 19.7893 17.4142 19.4142C17.7893 19.0391 18 18.5304 18 18V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Editar Dados
                  </button>
                  <button class="btn btn-primary" (click)="goToDashboard()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Voltar ao Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .pix-page {
      min-height: 100vh;
      background: var(--background-dark);
      padding: var(--spacing-xl) 0;
    }

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

    .setup-section,
    .result-section,
    .existing-section {
      display: flex;
      justify-content: center;
    }

    .instructions-card,
    .success-card,
    .error-card,
    .existing-card {
      max-width: 600px;
      padding: var(--spacing-2xl);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      text-align: center;
    }

    .instructions-card {
      max-width: 800px;
    }

    .success-card {
      border-left: 4px solid var(--success-green);
    }

    .error-card {
      border-left: 4px solid var(--error-red);
    }

    .existing-card {
      border-left: 4px solid var(--success-green);
    }

    .instructions-icon,
    .success-icon,
    .error-icon,
    .existing-icon {
      margin-bottom: var(--spacing-lg);
    }

    .instructions-icon {
      color: var(--primary-blue);
    }

    .success-icon,
    .existing-icon {
      color: var(--success-green);
    }

    .error-icon {
      color: var(--error-red);
    }

    .instructions-content h2,
    .success-content h3,
    .error-content h3,
    .existing-content h3 {
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .instructions-content h2 {
      font-size: var(--font-size-2xl);
      margin-bottom: var(--spacing-md);
    }

    .success-content h3,
    .error-content h3,
    .existing-content h3 {
      font-size: var(--font-size-xl);
    }

    .instructions-content > p,
    .success-content p,
    .error-content p,
    .existing-content > p {
      color: var(--text-secondary);
      margin: 0 0 var(--spacing-lg) 0;
    }

    .instructions-content > p {
      font-size: var(--font-size-lg);
      margin-bottom: var(--spacing-2xl);
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-2xl);
    }

    .step-card {
      display: flex;
      flex-direction: column;
      padding: var(--spacing-lg);
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      text-align: left;
      gap: var(--spacing-md);
    }

    .step-header {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      flex: 1;
    }

    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--primary-orange);
      color: white;
      border-radius: 50%;
      font-weight: 700;
      flex-shrink: 0;
    }

    .step-content h3 {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-xs) 0;
    }

    .step-content p {
      color: var(--text-secondary);
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: 1.5;
    }

    .step-btn {
      align-self: flex-start;
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-sm);
    }

    .form-section {
      max-width: 600px;
      margin: 0 auto;
    }

    .form-card {
      padding: var(--spacing-2xl);
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
    }

    .form-header {
      text-align: center;
      margin-bottom: var(--spacing-2xl);
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

    .form-input.readonly {
      background: var(--background-card);
      color: var(--text-muted);
      cursor: not-allowed;
    }

    .error-message {
      color: var(--error-red);
      font-size: var(--font-size-xs);
      margin-top: var(--spacing-xs);
    }

    .upload-section {
      padding: var(--spacing-lg);
      background: var(--background-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-lg);
    }

    .upload-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
      text-align: center;
    }

    .upload-icon {
      color: var(--primary-blue);
    }

    .upload-header h3,
    .form-header h2 {
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .form-header h2 {
      font-size: var(--font-size-2xl);
      margin-bottom: var(--spacing-sm);
    }

    .upload-header h3 {
      font-size: var(--font-size-lg);
    }

    .upload-header p,
    .form-header p {
      color: var(--text-secondary);
      margin: 0;
      font-size: var(--font-size-sm);
    }

    .file-upload {
      text-align: center;
    }

    .upload-button {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--primary-orange);
      color: white;
      border: none;
      border-radius: var(--border-radius-md);
      cursor: pointer;
      font-weight: 500;
      transition: background var(--transition-normal);
    }

    .upload-button:hover {
      background: var(--primary-orange-dark);
    }

    .form-actions,
    .action-buttons {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
    }

    .action-buttons {
      justify-content: center;
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

    .account-summary,
    .account-details {
      padding: var(--spacing-lg);
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-lg);
      text-align: left;
    }

    .account-summary h4 {
      font-size: var(--font-size-md);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--spacing-md) 0;
    }

    .summary-grid {
      display: grid;
      gap: var(--spacing-sm);
    }

    .summary-item,
    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-item {
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-color);
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .summary-label,
    .detail-label {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .detail-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .summary-value,
    .detail-value {
      color: var(--text-primary);
      font-weight: 500;
    }

    .detail-value.verified {
      color: var(--success-green);
      font-weight: 600;
    }

    .error-details {
      padding: var(--spacing-lg);
      background: var(--background-elevated);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-lg);
      text-align: left;
    }

    .error-details h4 {
      color: var(--text-primary);
      margin: 0 0 var(--spacing-sm) 0;
    }

    .error-details ul {
      color: var(--text-secondary);
      margin: 0;
      padding-left: var(--spacing-lg);
    }

    .step-card .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .step-card .btn:disabled:hover {
      background: var(--background-elevated);
      color: var(--text-muted);
    }

    .step-card .btn.btn-primary:disabled {
      background: var(--border-color);
      color: var(--text-muted);
    }

    .step-card .btn.btn-primary:disabled:hover {
      background: var(--border-color);
    }

    @media (max-width: 768px) {
      .pix-page {
        padding: var(--spacing-lg) 0;
      }

      .page-header {
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .steps-grid {
        grid-template-columns: 1fr;
      }

      .form-actions,
      .action-buttons {
        flex-direction: column;
      }
    }

    @media (max-width: 480px) {
      .instructions-card,
      .form-card,
      .success-card,
      .error-card,
      .existing-card {
        padding: var(--spacing-lg);
      }

      .summary-item,
      .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-xs);
      }
    }
  `]
})
export class PixAccountComponent implements OnInit {
  private router = inject(Router);
  protected userService = inject(UserService);
  protected loadingService = inject(LoadingService);

  hasExistingAccount = false;
  existingAccount: any = null;
  showForm = false;
  showBankSetup = false;
  accountCreated = false;
  validationSuccess = false;
  bankCredentialsConfigured = false;
  pixConfigured = false;

  pixKeyType = 'email';
  selectedFile: File | null = null;
  bankCredentials: any = null;

  accountData = {
    bankName: 'Banco EFI',
    accountNumber: '',
    pixKey: ''
  };

  ngOnInit() {
    this.checkExistingAccount();
  }

  private checkExistingAccount() {
    this.userService.getUserPixAccount().subscribe(account => {
      if (account) {
        this.hasExistingAccount = true;
        this.existingAccount = account;
        this.bankCredentialsConfigured = true;
        this.pixConfigured = true;
      }
    });
  }

  startBankSetup() {
    this.showBankSetup = true;
  }

  onBankSetupComplete(credentials: any) {
    this.bankCredentials = credentials;
    this.bankCredentialsConfigured = true;
    this.showBankSetup = false;
    
    // Salvar credenciais no serviço
    this.userService.saveBankCredentials(credentials).subscribe({
      next: (success: boolean) => {
        console.log('Credenciais salvas com sucesso');
      },
      error: (error: any) => {
        console.error('Erro ao salvar credenciais:', error);
      }
    });
  }

  onBankSetupCancelled() {
    this.showBankSetup = false;
  }

  openBankAccount() {
    // Abrir site do banco EFI para criar conta
    window.open('https://app.sejaefi.com.br/home', '_blank');
  }

  createAd() {
    // Redirecionar para página de criação de anúncio
    this.router.navigate(['/sell']);
  }

  showSetupForm() {
    if (this.bankCredentialsConfigured) {
      this.showForm = true;
    }
  }

  onPixKeyTypeChange() {
    this.accountData.pixKey = '';
  }

  getPixKeyPlaceholder(): string {
    switch (this.pixKeyType) {
      case 'email':
        return 'exemplo@email.com';
      case 'phone':
        return '11999887766';
      case 'cpf':
        return '12345678901';
      case 'random':
        return 'chave-aleatoria-do-banco';
      default:
        return '';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    this.userService.createPixAccount(this.accountData).subscribe({
      next: (success) => {
        this.accountCreated = true;
        this.pixConfigured = true;
        
        // Simular validação (pode falhar aleatoriamente para demonstração)
        this.validationSuccess = Math.random() > 0.2; // 80% de sucesso
      },
      error: (error) => {
        console.error('Erro ao configurar conta:', error);
      }
    });
  }

  retrySetup() {
    this.accountCreated = false;
    this.validationSuccess = false;
    this.showForm = true;
  }

  editAccount() {
    this.hasExistingAccount = false;
    this.showForm = true;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
