import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { PortfolioItem } from '../../core/models/portfolio.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [RouterLink, TranslateModule, CommonModule],
  template: `
    <div class="page-header">
      <div class="container">
        <h1 class="page-header__title">{{ 'catalog.title' | translate }}</h1>
        <p class="page-header__subtitle">{{ 'catalog.subtitle' | translate }}</p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        @if (loading()) {
          <div class="loading-center">
            <div class="spinner"></div>
          </div>
        } @else if (items().length === 0) {
          <p class="empty-state">{{ 'catalog.empty' | translate }}</p>
        } @else {
          <div class="catalog-grid">
            @for (item of items(); track item.id) {
              <a [routerLink]="['/catalog', item.slug]" class="catalog-card">
                <div class="catalog-card__image">
                  <img [src]="item.coverImage" [alt]="item.titleI18n['ru'] || item.titleI18n['en']"
                       loading="lazy" />
                </div>
                <div class="catalog-card__body">
                  <h2 class="catalog-card__title">{{ item.titleI18n['ru'] || item.titleI18n['en'] }}</h2>
                  @if (item.tags.length > 0) {
                    <div class="catalog-card__tags">
                      @for (tag of item.tags.slice(0, 3); track tag) {
                        <span class="tag">{{ tag }}</span>
                      }
                    </div>
                  }
                  <span class="catalog-card__link">{{ 'catalog.view' | translate }} →</span>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .page-header {
      background: var(--color-primary);
      color: var(--color-white);
      padding: var(--space-2xl) 0;
      text-align: center;
      &__title { font-family: var(--font-display); font-size: 40px; color: var(--color-white); margin-bottom: var(--space-sm); }
      &__subtitle { font-size: 16px; color: rgba(255,255,255,0.65); }
    }
    .loading-center { display: flex; justify-content: center; padding: var(--space-3xl); }
    .empty-state { text-align: center; color: var(--color-text-muted); padding: var(--space-3xl); }
    .catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-xl);
    }
    .catalog-card {
      display: block;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      background: var(--color-white);
      text-decoration: none;
      transition: transform var(--transition-normal), box-shadow var(--transition-normal);
      &:hover { transform: translateY(-4px); box-shadow: var(--shadow-xl); img { transform: scale(1.05); } }
      &__image { aspect-ratio: 4/3; overflow: hidden; background: var(--color-light); img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-slow); } }
      &__body { padding: var(--space-lg); }
      &__title { font-family: var(--font-display); font-size: 19px; color: var(--color-primary); margin-bottom: var(--space-sm); }
      &__tags { display: flex; gap: var(--space-xs); flex-wrap: wrap; margin-bottom: var(--space-sm); }
      &__link { font-size: 13px; font-weight: 600; color: var(--color-accent); }
    }
    .tag { background: var(--color-light); color: var(--color-text-muted); padding: 2px 10px; border-radius: 99px; font-size: 12px; }
  `],
})
export class CatalogComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly api = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly items = signal<PortfolioItem[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.seo.update({
      title: 'Portfolio',
      description: 'Browse our completed custom sliding door installations and projects.',
    });
    if (isPlatformBrowser(this.platformId)) {
      this.api.getPortfolio(1, 24).subscribe({
        next: (res) => {
          this.items.set(res.data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }
}
