import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { PortfolioItem } from '../../core/models/portfolio.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslateModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly api = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly featuredItems = signal<PortfolioItem[]>([]);

  readonly features = [
    { icon: '₴', key: 'instant_price', iconClass: 'feature-icon--gold' },
    { icon: '⊞', key: 'custom_fit', iconClass: 'feature-icon--dark' },
    { icon: '◈', key: 'premium_materials', iconClass: 'feature-icon--gold' },
    { icon: '→', key: 'fast_delivery', iconClass: 'feature-icon--dark' },
  ];

  ngOnInit(): void {
    this.seo.update({
      title: 'Custom Sliding Doors',
      description:
        'ZBURLIUC FURNITURE — premium custom sliding doors for your home or office. Configure online, see instant price, order today.',
    });
    this.seo.addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'ZBURLIUC FURNITURE',
      description: 'Custom sliding door design and manufacturing studio',
      '@id': 'https://zburliuc.com',
      url: 'https://zburliuc.com',
      telephone: '+373-XXX-XXXXX',
      priceRange: '€€',
      serviceType: 'Custom Sliding Doors',
    });

    if (isPlatformBrowser(this.platformId)) {
      this.api.getPortfolio(1, 3).subscribe({
        next: (res) => this.featuredItems.set(res.data),
        error: (err) => console.error('Failed to load featured items', err),
      });
    }
  }
}
