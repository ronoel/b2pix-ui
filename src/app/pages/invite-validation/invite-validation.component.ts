import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvitesService } from '../../shared/api/invites.service';

@Component({
  selector: 'app-invite-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="invite-validation-page">
      <div class="container">
        <div class="form-card">
          <div class="form-header">
            <h1>Validação de Convite</h1>
            <p>Insira o código do convite e seu nome de usuário para acessar a plataforma.</p>
          </div>
          <form (ngSubmit)="submit()" autocomplete="off">
            <div class="form-group">
              <label for="inviteCode">Código do Convite</label>
              <input id="inviteCode" name="inviteCode" type="text" class="form-input" [(ngModel)]="inviteCode" required autocomplete="off" />
            </div>
            <div class="form-group">
              <label for="username">Nome de Usuário</label>
              <input 
                id="username" 
                name="username" 
                type="text" 
                class="form-input" 
                [class.input-error]="usernameError()"
                [(ngModel)]="username" 
                (input)="onUsernameChange()"
                required 
                autocomplete="off" 
                placeholder="Ex: joao_silva123"
              />
              @if (usernameError()) {
                <div class="input-error-message">{{ usernameError() }}</div>
              }
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="loading() || !inviteCode || !username || usernameError()">
                @if (loading()) {
                  <span class="btn-loading"></span>
                } @else {
                  <span>Validar Convite</span>
                }
              </button>
            </div>
            @if (error()) {
              <div class="form-error">{{ error() }}</div>
            }
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .invite-validation-page {
      min-height: 100vh;
      background: var(--background-dark);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
      padding: var(--spacing-2xl) 0;
    }
    .form-card {
      background: var(--background-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-2xl);
      box-shadow: var(--shadow-md);
    }
    .form-header {
      text-align: center;
      margin-bottom: var(--spacing-xl);
    }
    .form-header h1 {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
    }
    .form-header p {
      color: var(--text-secondary);
      margin: 0;
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
    .form-input.input-error {
      border-color: var(--danger-red);
      background: rgba(220, 53, 69, 0.05);
    }
    .input-error-message {
      color: var(--danger-red);
      font-size: var(--font-size-xs);
      margin-top: var(--spacing-xs);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }
    .input-error-message::before {
      content: "⚠️";
      font-size: var(--font-size-xs);
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
    .btn-loading {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-right: 8px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .form-error {
      color: var(--danger-red);
      background: rgba(220, 53, 69, 0.1);
      border: 1px solid rgba(220, 53, 69, 0.3);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-md);
      margin-top: var(--spacing-md);
      text-align: center;
      font-weight: 500;
      font-size: var(--font-size-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      animation: shake 0.5s ease-in-out;
    }
    .form-error::before {
      content: "⚠️";
      font-size: var(--font-size-md);
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `]
})
export class InviteValidationComponent {
  private router = inject(Router);
  private invitesService = inject(InvitesService);
  
  inviteCode = '';
  username = '';
  loading = signal(false);
  error = signal('');
  usernameError = signal('');

  validateUsername(username: string): boolean {
    // Reset error
    this.usernameError.set('');
    
    if (!username) {
      this.usernameError.set('Nome de usuário é obrigatório');
      return false;
    }
    
    if (username.length < 3) {
      this.usernameError.set('Nome de usuário deve ter pelo menos 3 caracteres');
      return false;
    }
    
    if (username.length > 20) {
      this.usernameError.set('Nome de usuário deve ter no máximo 20 caracteres');
      return false;
    }
    
    // Only allow letters, numbers, underscore and hyphen
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      this.usernameError.set('Nome de usuário pode conter apenas letras, números, _ e -');
      return false;
    }
    
    // Cannot start with number or special character
    if (/^[0-9_-]/.test(username)) {
      this.usernameError.set('Nome de usuário deve começar com uma letra');
      return false;
    }
    
    return true;
  }

  onUsernameChange() {
    this.validateUsername(this.username);
  }

  submit() {
    if (!this.inviteCode || !this.username) return;
    
    // Validate username before submitting
    if (!this.validateUsername(this.username)) {
      return;
    }
    
    this.loading.set(true);
    this.error.set('');
    
    this.invitesService.claimInvite(this.inviteCode, this.username).subscribe({
      next: (response) => {
        
        if (response && response.status === 'claimed') {
          // Success: redirect to dashboard
          this.router.navigate(['/dashboard']);
        } else {
          this.error.set('Código de convite já foi usado ou não existe.');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error claiming invite:', error);
        if (error.status === 409) {
          this.error.set('Nome de usuário já existe. Tente outro nome de usuário.');
        } else {
          this.error.set(`${error.status} - ${error.error}.`);
        }
        this.loading.set(false);
      }
    });
  }
} 