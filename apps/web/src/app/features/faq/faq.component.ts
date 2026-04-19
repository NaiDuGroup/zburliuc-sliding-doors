import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';

interface FaqItem {
  q: string;
  a: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  template: `
    <div class="page-header">
      <div class="container">
        <h1 class="page-header__title">{{ 'faq.title' | translate }}</h1>
      </div>
    </div>
    <section class="section">
      <div class="container faq-container">
        <div class="faq-list">
          @for (item of items(); track item.q; let i = $index) {
            <div class="faq-item" [class.faq-item--open]="item.open" (click)="toggle(i)">
              <div class="faq-item__question">
                <span>{{ item.q }}</span>
                <span class="faq-item__arrow">{{ item.open ? '−' : '+' }}</span>
              </div>
              @if (item.open) {
                <div class="faq-item__answer">{{ item.a }}</div>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page-header { background: var(--color-primary); padding: var(--space-2xl) 0; text-align: center; &__title { font-family: var(--font-display); font-size: 40px; color: #fff; } }
    .faq-container { max-width: 720px; }
    .faq-list { display: flex; flex-direction: column; gap: var(--space-sm); }
    .faq-item { border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; cursor: pointer; transition: box-shadow var(--transition-fast); &:hover { box-shadow: var(--shadow-md); } &--open { border-color: var(--color-accent); } &__question { padding: var(--space-lg) var(--space-xl); display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 500; color: var(--color-primary); background: var(--color-white); } &__arrow { font-size: 22px; font-weight: 300; color: var(--color-accent); flex-shrink: 0; margin-left: var(--space-md); } &__answer { padding: 0 var(--space-xl) var(--space-lg); background: var(--color-off-white); font-size: 15px; color: var(--color-text-muted); line-height: 1.7; } }
  `],
})
export class FaqComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly translate = inject(TranslateService);

  readonly items = signal<FaqItem[]>([]);

  ngOnInit(): void {
    this.seo.update({
      title: 'FAQ',
      description:
        'Frequently asked questions about custom sliding doors: sizes, production time, materials, and installation.',
    });

    this.translate.get('faq.items').subscribe((rawItems: Array<{ q: string; a: string }>) => {
      const faqItems: FaqItem[] = rawItems.map((item) => ({
        ...item,
        open: false,
      }));
      this.items.set(faqItems);

      this.seo.addStructuredData({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: rawItems.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      });
    });
  }

  toggle(index: number): void {
    this.items.update((items) =>
      items.map((item, i) => ({
        ...item,
        open: i === index ? !item.open : false,
      })),
    );
  }
}
