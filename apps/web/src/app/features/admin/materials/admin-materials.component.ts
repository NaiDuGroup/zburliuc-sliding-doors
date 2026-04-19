import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Material, MaterialType } from '../../../core/models/material.model';

interface ColorOptionForm {
  value: string;      // e.g. "black", "silver"
  labelRu: string;
  labelEn: string;
  hexColor: string;   // fallback swatch when no photo
  imageUrl: string;   // photo of this specific color variant
}

@Component({
  selector: 'app-admin-materials',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="admin-page__header">
        <h1>{{ 'admin.materials.title' | translate }}</h1>
        <button class="btn btn--primary btn--sm" (click)="openForm(null)">
          + {{ 'admin.materials.add' | translate }}
        </button>
      </div>

      @if (loading()) {
        <div class="loading-center"><div class="spinner"></div></div>
      } @else {
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>{{ 'admin.materials.name' | translate }}</th>
                <th>{{ 'admin.materials.type' | translate }}</th>
                <th>{{ 'admin.materials.price' | translate }}</th>
                <th>Цвета</th>
                <th>{{ 'admin.materials.active' | translate }}</th>
                <th>{{ 'admin.materials.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (mat of materials(); track mat.id) {
                <tr>
                  <td>
                    @if (mat.imageUrl) {
                      <img [src]="mat.imageUrl" [alt]="mat.nameI18n['en']"
                        style="width:36px;height:36px;object-fit:cover;border-radius:4px;margin-right:8px;vertical-align:middle" />
                    }
                    {{ mat.nameI18n['ru'] || mat.nameI18n['en'] }}
                  </td>
                  <td><span class="badge badge--active">{{ mat.type }}</span></td>
                  <td>{{ mat.pricePerM2 }} €</td>
                  <td>
                    <div class="color-swatches">
                      @for (c of mat.colorOptions; track c.value) {
                        <span class="color-swatch-sm" [style.background]="c.hexColor" [title]="c.labelI18n['ru']"></span>
                      }
                      @if (!mat.colorOptions.length) {
                        <span style="color:var(--color-text-light);font-size:12px">—</span>
                      }
                    </div>
                  </td>
                  <td>
                    <span class="badge" [class]="mat.isActive ? 'badge--active' : 'badge--inactive'">
                      {{ mat.isActive ? '✓' : '✗' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn--ghost btn--sm" (click)="openForm(mat)">
                      {{ 'admin.materials.edit' | translate }}
                    </button>
                    <button class="btn btn--ghost btn--sm" style="color:var(--color-error)" (click)="deleteMaterial(mat.id)">
                      {{ 'admin.materials.delete' | translate }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (showForm()) {
      <div class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <button class="modal__close" (click)="closeForm()">✕</button>
          <h2>{{ editing() ? 'Редактировать материал' : 'Добавить материал' }}</h2>

          <div class="form-stack">

            <!-- Basic info -->
            <div class="form-group">
              <label class="form-label">Slug (уникальный ключ)</label>
              <input class="form-input" [(ngModel)]="form.slug" placeholder="e.g. clear-glass" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Название (RU)</label>
                <input class="form-input" [(ngModel)]="form.nameRu" />
              </div>
              <div class="form-group">
                <label class="form-label">Name (EN)</label>
                <input class="form-input" [(ngModel)]="form.nameEn" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Тип</label>
                <select class="form-select" [(ngModel)]="form.type">
                  @for (t of materialTypes; track t) {
                    <option [value]="t">{{ t }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Цена / м² (€)</label>
                <input class="form-input" type="number" [(ngModel)]="form.price" />
              </div>
            </div>

            <!-- Image -->
            <div class="form-group">
              <label class="form-label">URL фото материала</label>
              <input class="form-input" [(ngModel)]="form.imageUrl" placeholder="https://..." />
              @if (form.imageUrl) {
                <div style="margin-top:10px;display:flex;align-items:center;gap:12px">
                  <img [src]="form.imageUrl" alt="preview"
                    style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:2px solid var(--color-border)" />
                  <span style="font-size:12px;color:var(--color-text-muted)">Превью</span>
                </div>
              }
            </div>

            <!-- ─── Color options ─── -->
            <div class="color-section">
              <div class="color-section__header">
                <div>
                  <div class="color-section__title">Цвета / варианты</div>
                  <div class="color-section__desc">
                    Один материал — несколько цветов, одна цена.<br/>
                    Клиент выбирает цвет в конфигураторе.
                  </div>
                </div>
                <button class="btn btn--ghost btn--sm" (click)="addColor()">+ Добавить цвет</button>
              </div>

              @if (colorOptions.length === 0) {
                <div class="color-empty">Цвета не добавлены — материал без вариантов</div>
              }

              @for (c of colorOptions; track $index; let i = $index) {
                <div class="color-entry">
                  <!-- Row 1: swatch + key + labels + delete -->
                  <div class="color-entry__top">
                    <div class="color-preview"
                      [style.backgroundImage]="c.imageUrl ? 'url(' + c.imageUrl + ')' : null"
                      [style.backgroundSize]="c.imageUrl ? 'cover' : null"
                      [style.backgroundPosition]="c.imageUrl ? 'center' : null"
                      [style.background]="!c.imageUrl ? (c.hexColor || '#ccc') : null">
                    </div>

                    <div class="color-picker-wrap">
                      <span class="color-field-label">Hex</span>
                      <input type="color" class="color-picker-input" [(ngModel)]="c.hexColor" />
                    </div>

                    <div class="color-field">
                      <span class="color-field-label">Key</span>
                      <input class="form-input form-input--sm" [(ngModel)]="c.value" placeholder="dark" />
                    </div>

                    <div class="color-field">
                      <span class="color-field-label">RU</span>
                      <input class="form-input form-input--sm" [(ngModel)]="c.labelRu" placeholder="Тёмный" />
                    </div>

                    <div class="color-field">
                      <span class="color-field-label">EN</span>
                      <input class="form-input form-input--sm" [(ngModel)]="c.labelEn" placeholder="Dark" />
                    </div>

                    <button class="color-delete" (click)="removeColor(i)">✕</button>
                  </div>

                  <!-- Row 2: photo URL (always visible) -->
                  <div class="color-entry__photo">
                    <span class="color-field-label" style="white-space:nowrap">📷 URL фото</span>
                    <input class="form-input form-input--sm"
                      style="flex:1"
                      [(ngModel)]="c.imageUrl"
                      placeholder="https://example.com/oak-dark.jpg" />
                    @if (c.imageUrl) {
                      <img [src]="c.imageUrl" style="width:36px;height:36px;object-fit:cover;border-radius:4px;border:1px solid var(--color-border);flex-shrink:0" alt="" />
                    }
                  </div>
                </div>
              }
            </div>

            <div class="form-check">
              <input type="checkbox" [(ngModel)]="form.isActive" id="isActive" />
              <label for="isActive">Активен</label>
            </div>

            @if (formError()) {
              <div class="alert alert--error">{{ formError() }}</div>
            }

            <div style="display:flex;gap:12px">
              <button class="btn btn--primary" (click)="saveMaterial()">{{ 'common.save' | translate }}</button>
              <button class="btn btn--ghost" (click)="closeForm()">{{ 'common.cancel' | translate }}</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .admin-page {
      padding: var(--space-xl);
      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-xl);
        h1 { font-family: var(--font-display); font-size: 28px; }
      }
    }
    .loading-center { display: flex; justify-content: center; padding: var(--space-3xl); }
    .admin-table-wrap { overflow-x: auto; background: var(--color-white); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
    .admin-table {
      width: 100%; border-collapse: collapse;
      th { padding: var(--space-md) var(--space-lg); text-align: left; font-size: 13px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--color-border); background: var(--color-off-white); }
      td { padding: var(--space-md) var(--space-lg); font-size: 14px; border-bottom: 1px solid var(--color-border); }
      tr:last-child td { border-bottom: none; }
      tr:hover td { background: var(--color-off-white); }
    }
    .color-swatches { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
    .color-swatch-sm { display: inline-block; width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid var(--color-border); }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; padding: var(--space-lg); }
    .modal {
      background: var(--color-white); border-radius: var(--radius-xl); padding: var(--space-2xl); width: 100%; max-width: 600px; position: relative; max-height: 90vh; overflow-y: auto;
      h2 { font-family: var(--font-display); font-size: 22px; margin-bottom: var(--space-xl); }
      &__close { position: absolute; top: var(--space-lg); right: var(--space-lg); font-size: 18px; background: none; border: none; color: var(--color-text-muted); cursor: pointer; }
    }
    .form-stack { display: flex; flex-direction: column; gap: var(--space-md); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
    .form-input--sm { padding: 6px 10px; font-size: 13px; }
    .form-check { display: flex; align-items: center; gap: var(--space-sm); font-size: 15px; input { width: 18px; height: 18px; cursor: pointer; } }

    /* Color options section */
    .color-section {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px var(--space-md);
        background: var(--color-off-white);
        border-bottom: 1px solid var(--color-border);
        gap: var(--space-md);
      }

      &__title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text);
      }

      &__desc {
        font-size: 12px;
        color: var(--color-text-muted);
        line-height: 1.4;
        margin-top: 2px;
      }
    }

    .color-empty {
      padding: var(--space-md);
      font-size: 13px;
      color: var(--color-text-light);
      text-align: center;
    }

    .color-entry {
      border-bottom: 1px solid var(--color-border);

      &:last-child { border-bottom: none; }

      &__top {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px var(--space-md) 6px;
        flex-wrap: wrap;
      }

      &__photo {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px var(--space-md) 10px;
        background: #f8f7f5;
      }
    }

    .color-preview {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid var(--color-border);
      flex-shrink: 0;
    }

    .color-picker-wrap {
      display: flex;
      flex-direction: column;
      gap: 2px;
      align-items: center;
    }

    .color-picker-input {
      width: 36px;
      height: 28px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 2px;
      cursor: pointer;
      background: none;
    }

    .color-field {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 70px;
    }

    .color-field-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .color-delete {
      background: none;
      border: none;
      color: var(--color-error);
      cursor: pointer;
      font-size: 14px;
      padding: 4px 6px;
      border-radius: var(--radius-sm);
      flex-shrink: 0;
      &:hover { background: #fef2f2; }
    }
  `],
})
export class AdminMaterialsComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly materials = signal<Material[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly editing = signal<Material | null>(null);
  readonly formError = signal('');

  readonly materialTypes: MaterialType[] = [
    'GLASS', 'WOOD', 'MIRROR', 'LACOBEL', 'ALUMINUM', 'FABRIC', 'OTHER',
  ];

  form = {
    slug: '',
    nameRu: '',
    nameEn: '',
    type: 'GLASS' as MaterialType,
    price: 0,
    imageUrl: '',
    isActive: true,
  };

  colorOptions: ColorOptionForm[] = [];

  ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials(): void {
    this.loading.set(true);
    this.api.getAdminMaterials(1, 100).subscribe({
      next: (res) => {
        this.materials.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openForm(mat: Material | null): void {
    this.editing.set(mat);
    if (mat) {
      this.form = {
        slug: mat.slug,
        nameRu: mat.nameI18n['ru'] ?? '',
        nameEn: mat.nameI18n['en'] ?? '',
        type: mat.type,
        price: mat.pricePerM2,
        imageUrl: mat.imageUrl ?? '',
        isActive: mat.isActive,
      };
      this.colorOptions = (mat.colorOptions ?? []).map((c) => ({
        value: c.value,
        labelRu: c.labelI18n?.['ru'] ?? '',
        labelEn: c.labelI18n?.['en'] ?? '',
        hexColor: c.hexColor ?? '#cccccc',
        imageUrl: c.imageUrl ?? '',
      }));
    } else {
      this.form = { slug: '', nameRu: '', nameEn: '', type: 'GLASS', price: 0, imageUrl: '', isActive: true };
      this.colorOptions = [];
    }
    this.formError.set('');
    this.showForm.set(true);
  }

  addColor(): void {
    this.colorOptions = [
      ...this.colorOptions,
      { value: '', labelRu: '', labelEn: '', hexColor: '#cccccc', imageUrl: '' },
    ];
  }

  removeColor(index: number): void {
    this.colorOptions = this.colorOptions.filter((_, i) => i !== index);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
    this.colorOptions = [];
  }

  saveMaterial(): void {
    const colorOptionsPayload = this.colorOptions
      .filter((c) => c.value.trim())
      .map((c) => ({
        value: c.value.trim(),
        hexColor: c.hexColor,
        imageUrl: c.imageUrl.trim() || undefined,
        labelI18n: {
          ru: c.labelRu.trim() || c.value,
          en: c.labelEn.trim() || c.value,
        },
      }));

    const payload = {
      slug: this.form.slug,
      nameI18n: { ru: this.form.nameRu, en: this.form.nameEn },
      type: this.form.type,
      pricePerM2: this.form.price,
      imageUrl: this.form.imageUrl || undefined,
      isActive: this.form.isActive,
      colorOptions: colorOptionsPayload,
    };

    const existing = this.editing();
    const obs = existing
      ? this.api.updateMaterial(existing.id, payload)
      : this.api.createMaterial(payload);

    obs.subscribe({
      next: () => {
        this.closeForm();
        this.loadMaterials();
      },
      error: (err) => this.formError.set(err.error?.message ?? 'Error saving material'),
    });
  }

  deleteMaterial(id: string): void {
    if (!confirm('Delete this material?')) return;
    this.api.deleteMaterial(id).subscribe({
      next: () => this.loadMaterials(),
    });
  }
}
