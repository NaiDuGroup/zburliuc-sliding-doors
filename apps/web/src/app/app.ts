import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly mobileMenuOpen = signal(false);
  readonly langDropdownOpen = signal(false);
  readonly currentLang = signal('ru');

  readonly languages = [
    { code: 'ru', label: 'RU', name: 'Русский' },
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'de', label: 'DE', name: 'Deutsch' },
  ];

  ngOnInit(): void {
    this.translate.addLangs(['ru', 'en', 'de']);

    let lang = 'ru';
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('zbur_lang');
      lang = saved ?? navigator.language.split('-')[0];
      if (!['ru', 'en', 'de'].includes(lang)) lang = 'ru';
    }
    this.translate.use(lang);
    this.currentLang.set(lang);
  }

  switchLang(lang: string): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('zbur_lang', lang);
    }
  }

  selectLang(lang: string): void {
    this.switchLang(lang);
    this.langDropdownOpen.set(false);
  }

  toggleLangDropdown(): void {
    this.langDropdownOpen.update((v) => !v);
  }

  closeLangDropdown(): void {
    this.langDropdownOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
