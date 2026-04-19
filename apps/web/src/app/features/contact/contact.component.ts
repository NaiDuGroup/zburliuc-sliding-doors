import { Component, OnInit, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="page-header">
      <div class="container">
        <h1 class="page-header__title">{{ 'contact.title' | translate }}</h1>
        <p class="page-header__subtitle">{{ 'contact.subtitle' | translate }}</p>
      </div>
    </div>
    <section class="section">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-info">
            <div class="contact-item">
              <div class="contact-item__icon">📞</div>
              <div>
                <div class="contact-item__label">{{ 'contact.phone' | translate }}</div>
                <a href="tel:+373XXXXXXX" class="contact-item__value">+373 XX XXX XXX</a>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-item__icon">✉</div>
              <div>
                <div class="contact-item__label">{{ 'contact.email' | translate }}</div>
                <a href="mailto:info@zburliuc.com" class="contact-item__value">info&#64;zburliuc.com</a>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-item__icon">📍</div>
              <div>
                <div class="contact-item__label">{{ 'contact.address' | translate }}</div>
                <span class="contact-item__value">Moldova</span>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-item__icon">🕐</div>
              <div>
                <div class="contact-item__label">{{ 'contact.schedule' | translate }}</div>
                <span class="contact-item__value">{{ 'contact.schedule_val' | translate }}</span>
              </div>
            </div>
          </div>
          <div class="contact-map">
            <div class="map-placeholder">
              <span>📍 Map</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-header { background: var(--color-primary); padding: var(--space-2xl) 0; text-align: center; &__title { font-family: var(--font-display); font-size: 40px; color: #fff; margin-bottom: var(--space-sm); } &__subtitle { font-size: 16px; color: rgba(255,255,255,0.65); } }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2xl); @media (max-width: 768px) { grid-template-columns: 1fr; } }
    .contact-info { display: flex; flex-direction: column; gap: var(--space-xl); }
    .contact-item { display: flex; gap: var(--space-lg); align-items: flex-start; &__icon { font-size: 28px; flex-shrink: 0; } &__label { font-size: 13px; color: var(--color-text-muted); margin-bottom: 2px; } &__value { font-size: 17px; font-weight: 500; color: var(--color-primary); } }
    a.contact-item__value { color: var(--color-accent); text-decoration: none; &:hover { text-decoration: underline; } }
    .map-placeholder { background: var(--color-light); border-radius: var(--radius-lg); height: 360px; display: flex; align-items: center; justify-content: center; font-size: 48px; color: var(--color-text-muted); }
  `],
})
export class ContactComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Contact',
      description: 'Contact ZBURLIUC FURNITURE for custom sliding doors. Phone, email, address.',
    });
    this.seo.addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact ZBURLIUC FURNITURE',
    });
  }
}
