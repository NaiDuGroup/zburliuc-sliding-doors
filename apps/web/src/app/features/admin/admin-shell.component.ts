import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslateModule],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <div class="admin-sidebar__brand">
          <span class="admin-brand-name">ZBURLIUC</span>
          <span class="admin-brand-sub">ADMIN</span>
        </div>
        @if (auth.adminName()) {
          <div class="admin-sidebar__user">{{ auth.adminName() }}</div>
        }
        <nav class="admin-nav">
          <a routerLink="/admin/quotes" routerLinkActive="active" class="admin-nav__link">
            <span>📋</span> {{ 'admin.nav.quotes' | translate }}
          </a>
          <a routerLink="/admin/materials" routerLinkActive="active" class="admin-nav__link">
            <span>🪞</span> {{ 'admin.nav.materials' | translate }}
          </a>
          <a routerLink="/admin/portfolio" routerLinkActive="active" class="admin-nav__link">
            <span>🖼</span> {{ 'admin.nav.portfolio' | translate }}
          </a>
          <a routerLink="/admin/pricing" routerLinkActive="active" class="admin-nav__link">
            <span>💰</span> Настройки цен
          </a>
        </nav>
        <button class="admin-nav__logout" (click)="auth.logout()">
          {{ 'admin.nav.logout' | translate }}
        </button>
      </aside>
      <main class="admin-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; }
    .admin-sidebar { width: 240px; background: var(--color-primary); color: var(--color-white); display: flex; flex-direction: column; padding: var(--space-xl) 0; flex-shrink: 0; &__brand { text-align: center; padding: 0 var(--space-lg) var(--space-xl); border-bottom: 1px solid rgba(255,255,255,0.1); } &__user { padding: var(--space-md) var(--space-lg); font-size: 13px; color: rgba(255,255,255,0.6); } }
    .admin-brand-name { display: block; font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: 0.08em; }
    .admin-brand-sub { display: block; font-size: 10px; letter-spacing: 0.2em; color: var(--color-accent); text-transform: uppercase; }
    .admin-nav { flex: 1; display: flex; flex-direction: column; padding: var(--space-md) 0; &__link { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-md) var(--space-xl); font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.7); text-decoration: none; transition: all var(--transition-fast); &:hover, &.active { background: rgba(255,255,255,0.08); color: var(--color-white); } &.active { border-left: 3px solid var(--color-accent); } } &__logout { margin: var(--space-lg) var(--space-xl) 0; padding: 10px; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); font-size: 14px; background: none; cursor: pointer; transition: all var(--transition-fast); &:hover { background: rgba(255,255,255,0.08); color: var(--color-white); } } }
    .admin-main { flex: 1; background: var(--color-off-white); overflow: auto; }
  `],
})
export class AdminShellComponent {
  readonly auth = inject(AuthService);
}
