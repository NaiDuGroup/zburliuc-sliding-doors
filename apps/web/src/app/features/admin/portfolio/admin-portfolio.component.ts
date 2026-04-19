import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { PortfolioItem } from '../../../core/models/portfolio.model';

@Component({
  selector: 'app-admin-portfolio',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="admin-page__header">
        <h1>{{ 'admin.portfolio.title' | translate }}</h1>
        <button class="btn btn--primary btn--sm" (click)="openForm(null)">
          + {{ 'admin.portfolio.add' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="loading-center"><div class="spinner"></div></div>
      } @else {
        <div class="portfolio-admin-grid">
          @for (item of items(); track item.id) {
            <div class="portfolio-admin-card">
              <div class="portfolio-admin-card__img">
                <img [src]="item.coverImage" [alt]="item.titleI18n['en']" />
              </div>
              <div class="portfolio-admin-card__body">
                <h3>{{ item.titleI18n['ru'] || item.titleI18n['en'] }}</h3>
                <span class="badge" [class]="item.isPublished ? 'badge--active' : 'badge--inactive'">
                  {{ item.isPublished ? ('admin.portfolio.published' | translate) : ('admin.portfolio.draft' | translate) }}
                </span>
              </div>
              <div class="portfolio-admin-card__actions">
                <button class="btn btn--ghost btn--sm" (click)="openForm(item)">Edit</button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    @if (showForm()) {
      <div class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <button class="modal__close" (click)="closeForm()">✕</button>
          <h2>{{ editing() ? 'Edit Item' : 'Add Portfolio Item' }}</h2>
          <div class="form-stack">
            <div class="form-group">
              <label class="form-label">Slug</label>
              <input class="form-input" [(ngModel)]="form.slug" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Title (RU)</label>
                <input class="form-input" [(ngModel)]="form.titleRu" />
              </div>
              <div class="form-group">
                <label class="form-label">Title (EN)</label>
                <input class="form-input" [(ngModel)]="form.titleEn" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Cover Image URL</label>
              <input class="form-input" [(ngModel)]="form.coverImage" />
            </div>
            <div class="form-group">
              <label class="form-label">Description (RU)</label>
              <textarea class="form-textarea" [(ngModel)]="form.descRu"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Tags (comma-separated)</label>
              <input class="form-input" [(ngModel)]="form.tags" placeholder="modern, glass, wardrobe" />
            </div>
            <div class="form-check">
              <input type="checkbox" [(ngModel)]="form.isPublished" id="isPublished" />
              <label for="isPublished">Published</label>
            </div>
            @if (formError()) {
              <div class="alert alert--error">{{ formError() }}</div>
            }
            <div style="display:flex;gap:12px">
              <button class="btn btn--primary" (click)="saveItem()">{{ 'common.save' | translate }}</button>
              <button class="btn btn--ghost" (click)="closeForm()">{{ 'common.cancel' | translate }}</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-page { padding: var(--space-xl); &__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl); h1 { font-family: var(--font-display); font-size: 28px; } } }
    .loading-center { display: flex; justify-content: center; padding: var(--space-3xl); }
    .portfolio-admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-lg); }
    .portfolio-admin-card { background: var(--color-white); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); &__img { aspect-ratio: 4/3; overflow: hidden; background: var(--color-light); img { width: 100%; height: 100%; object-fit: cover; } } &__body { padding: var(--space-md); h3 { font-size: 15px; font-weight: 600; margin-bottom: var(--space-xs); } } &__actions { padding: 0 var(--space-md) var(--space-md); } }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: var(--space-lg); }
    .modal { background: var(--color-white); border-radius: var(--radius-xl); padding: var(--space-2xl); width: 100%; max-width: 520px; position: relative; max-height: 80vh; overflow-y: auto; h2 { font-family: var(--font-display); font-size: 22px; margin-bottom: var(--space-xl); } &__close { position: absolute; top: var(--space-lg); right: var(--space-lg); font-size: 18px; background: none; border: none; color: var(--color-text-muted); cursor: pointer; } }
    .form-stack { display: flex; flex-direction: column; gap: var(--space-md); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
    .form-check { display: flex; align-items: center; gap: var(--space-sm); font-size: 15px; input { width: 18px; height: 18px; cursor: pointer; } }
  `],
})
export class AdminPortfolioComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly items = signal<PortfolioItem[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly editing = signal<PortfolioItem | null>(null);
  readonly formError = signal('');

  form = {
    slug: '',
    titleRu: '',
    titleEn: '',
    coverImage: '',
    descRu: '',
    tags: '',
    isPublished: false,
  };

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.api.getAdminPortfolio(1, 50).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openForm(item: PortfolioItem | null): void {
    this.editing.set(item);
    if (item) {
      this.form = {
        slug: item.slug,
        titleRu: item.titleI18n['ru'] ?? '',
        titleEn: item.titleI18n['en'] ?? '',
        coverImage: item.coverImage,
        descRu: item.descI18n['ru'] ?? '',
        tags: item.tags.join(', '),
        isPublished: item.isPublished,
      };
    } else {
      this.form = { slug: '', titleRu: '', titleEn: '', coverImage: '', descRu: '', tags: '', isPublished: false };
    }
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
  }

  saveItem(): void {
    const payload = {
      slug: this.form.slug,
      titleI18n: { ru: this.form.titleRu, en: this.form.titleEn },
      descI18n: { ru: this.form.descRu },
      coverImage: this.form.coverImage,
      imageUrls: [this.form.coverImage],
      tags: this.form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      isPublished: this.form.isPublished,
    };

    const existing = this.editing();
    const obs = existing
      ? this.api.updatePortfolioItem(existing.id, payload)
      : this.api.createPortfolioItem(payload);

    obs.subscribe({
      next: () => {
        this.closeForm();
        this.loadItems();
      },
      error: (err) => this.formError.set(err.error?.message ?? 'Error saving'),
    });
  }
}
