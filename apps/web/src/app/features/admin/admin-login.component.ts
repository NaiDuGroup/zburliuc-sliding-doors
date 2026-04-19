import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-card__brand">
          <span class="brand-name">ZBURLIUC</span>
          <span class="brand-sub">ADMIN</span>
        </div>
        <h1 class="login-card__title">{{ 'admin.login.title' | translate }}</h1>

        <form (ngSubmit)="submit()" class="login-form">
          <div class="form-group">
            <label class="form-label">{{ 'admin.login.email' | translate }}</label>
            <input type="email" class="form-input" [(ngModel)]="email" name="email" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'admin.login.password' | translate }}</label>
            <input type="password" class="form-input" [(ngModel)]="password" name="password" required />
          </div>

          @if (error()) {
            <div class="alert alert--error">{{ error() }}</div>
          }

          <button type="submit" class="btn btn--primary btn--full" [disabled]="loading()">
            @if (loading()) {
              <div class="spinner"></div>
            }
            {{ 'admin.login.submit' | translate }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-off-white); padding: var(--space-lg); }
    .login-card { background: var(--color-white); border-radius: var(--radius-xl); box-shadow: var(--shadow-xl); padding: var(--space-2xl); width: 100%; max-width: 420px; &__brand { display: flex; flex-direction: column; align-items: center; margin-bottom: var(--space-lg); } &__title { font-family: var(--font-display); font-size: 24px; text-align: center; margin-bottom: var(--space-xl); } }
    .brand-name { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em; }
    .brand-sub { font-size: 11px; font-weight: 600; letter-spacing: 0.2em; color: var(--color-accent); text-transform: uppercase; }
    .login-form { display: flex; flex-direction: column; gap: var(--space-md); }
  `],
})
export class AdminLoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal('');

  submit(): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/quotes']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Invalid credentials');
      },
    });
  }
}
