import { Component, OnInit, inject, signal, input, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { PortfolioItem } from '../../core/models/portfolio.model';

@Component({
  selector: 'app-portfolio-detail',
  standalone: true,
  imports: [RouterLink, TranslateModule, CommonModule],
  template: `
    @if (item()) {
      <div class="detail-page">
        <div class="detail-hero" [style.background-image]="'url(' + item()!.coverImage + ')'">
          <div class="detail-hero__overlay">
            <div class="container">
              <h1 class="detail-hero__title">{{ item()!.titleI18n['ru'] || item()!.titleI18n['en'] }}</h1>
            </div>
          </div>
        </div>
        <section class="section">
          <div class="container">
            <div class="detail-layout">
              <div class="detail-content">
                <p class="detail-desc">{{ item()!.descI18n['ru'] || item()!.descI18n['en'] }}</p>
                @if (item()!.tags.length > 0) {
                  <div class="detail-tags">
                    @for (tag of item()!.tags; track tag) {
                      <span class="tag">{{ tag }}</span>
                    }
                  </div>
                }
                <a routerLink="/configurator" class="btn btn--primary" style="margin-top:24px">
                  Configure Similar Door →
                </a>
              </div>
              <div class="detail-gallery">
                @for (img of item()!.imageUrls; track img) {
                  <div class="gallery-img">
                    <img [src]="img" [alt]="item()!.titleI18n['en']" loading="lazy" />
                  </div>
                }
              </div>
            </div>
          </div>
        </section>
      </div>
    } @else if (loading()) {
      <div class="loading-center section"><div class="spinner"></div></div>
    }
  `,
  styles: [`
    .detail-hero { min-height: 400px; background-size: cover; background-position: center; }
    .detail-hero__overlay { min-height: 400px; background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)); display: flex; align-items: flex-end; padding-bottom: 40px; }
    .detail-hero__title { font-family: var(--font-display); font-size: 42px; color: #fff; }
    .detail-layout { display: grid; grid-template-columns: 360px 1fr; gap: var(--space-2xl); @media (max-width: 768px) { grid-template-columns: 1fr; } }
    .detail-desc { font-size: 16px; color: var(--color-text-muted); line-height: 1.8; margin-bottom: var(--space-lg); }
    .detail-tags { display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-bottom: var(--space-lg); }
    .detail-gallery { display: flex; flex-direction: column; gap: var(--space-md); }
    .gallery-img img { width: 100%; border-radius: var(--radius-lg); box-shadow: var(--shadow-md); }
    .loading-center { display: flex; justify-content: center; }
    .tag { background: var(--color-light); color: var(--color-text-muted); padding: 2px 10px; border-radius: 99px; font-size: 12px; }
  `],
})
export class PortfolioDetailComponent implements OnInit {
  readonly slug = input<string>('');
  private readonly seo = inject(SeoService);
  private readonly api = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly item = signal<PortfolioItem | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    const slug = this.slug();
    if (slug && isPlatformBrowser(this.platformId)) {
      this.api.getPortfolioItem(slug).subscribe({
        next: (item) => {
          this.item.set(item);
          this.loading.set(false);
          this.seo.update({
            title: item.titleI18n['en'] ?? item.titleI18n['ru'],
            description: item.descI18n['en'] ?? item.descI18n['ru'] ?? '',
            image: item.coverImage,
            type: 'article',
          });
        },
        error: () => this.loading.set(false),
      });
    }
  }
}
