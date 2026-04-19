import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly siteName = 'ZBURLIUC FURNITURE';
  private readonly defaultImage = '/assets/og-image.jpg';

  update(config: SeoConfig): void {
    const fullTitle = `${config.title} | ${this.siteName}`;
    this.title.setTitle(fullTitle);

    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({
      property: 'og:image',
      content: config.image ?? this.defaultImage,
    });
    this.meta.updateTag({ property: 'og:type', content: config.type ?? 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: this.siteName });

    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
    }

    if (config.noIndex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }
  }

  addStructuredData(data: Record<string, unknown>): void {
    const existing = this.doc.querySelector('#structured-data');
    if (existing) existing.remove();

    const script = this.doc.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }

  addHreflang(lang: string, url: string): void {
    const id = `hreflang-${lang}`;
    const existing = this.doc.querySelector(`#${id}`);
    if (existing) existing.remove();

    const link = this.doc.createElement('link');
    link.id = id;
    link.rel = 'alternate';
    link.hreflang = lang;
    link.href = url;
    this.doc.head.appendChild(link);
  }

  initGA4(measurementId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if ((window as Window & { gtag?: unknown }).gtag) return;

    const script = this.doc.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    this.doc.head.appendChild(script);

    const inlineScript = this.doc.createElement('script');
    inlineScript.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `;
    this.doc.head.appendChild(inlineScript);
  }

  trackEvent(action: string, category: string, label?: string, value?: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
      });
    }
  }
}
