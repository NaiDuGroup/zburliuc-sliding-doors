import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HardwarePricingItem } from '../../../core/models/hardware-pricing.model';

@Component({
  selector: 'app-admin-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page">
      <div class="admin-page__header">
        <h1>Настройки цен</h1>
      </div>

      @if (loading()) {
        <div class="loading-center"><div class="spinner"></div></div>
      } @else {
        <div class="pricing-info">
          <p>
            Здесь настраиваются фиксированные составляющие итоговой цены.
            Цена материалов рассчитывается автоматически по прайс-листу материалов
            (€/м²) и площади секций.
          </p>
        </div>

        <div class="pricing-cards">
          @for (item of items(); track item.id) {
            <div class="pricing-card">
              <div class="pricing-card__header">
                <div class="pricing-card__label">{{ item.labelI18n['ru'] }}</div>
                <div class="pricing-card__sublabel">{{ item.labelI18n['en'] }}</div>
              </div>

              <div class="pricing-card__body">
                @if (item.priceFixed !== null) {
                  <div class="price-field">
                    <label class="price-field__label">
                      Цена за полотно (€)
                      <span class="price-field__hint">умножается на количество полотен</span>
                    </label>
                    <div class="price-field__input-wrap">
                      <input class="form-input price-input"
                        type="number"
                        [min]="0"
                        [step]="1"
                        [(ngModel)]="item.priceFixed"
                        (ngModelChange)="markDirty(item.id)" />
                      <span class="price-unit">€ / полотно</span>
                    </div>
                    <div class="price-field__example">
                      Например: 3 полотна × {{ item.priceFixed }} € = {{ (3 * (item.priceFixed ?? 0)) | number:'1.0-0' }} €
                    </div>
                  </div>
                }

                @if (item.pricePerM !== null) {
                  <div class="price-field">
                    <label class="price-field__label">
                      Цена за погонный метр (€/м)
                      <span class="price-field__hint">умножается на периметр проёма</span>
                    </label>
                    <div class="price-field__input-wrap">
                      <input class="form-input price-input"
                        type="number"
                        [min]="0"
                        [step]="0.5"
                        [(ngModel)]="item.pricePerM"
                        (ngModelChange)="markDirty(item.id)" />
                      <span class="price-unit">€ / м</span>
                    </div>
                    <div class="price-field__example">
                      Например: проём 2400×2200 мм → периметр {{ examplePerimeter }} м × {{ item.pricePerM }} € = {{ (examplePerimeter * (item.pricePerM ?? 0)) | number:'1.0-0' }} €
                    </div>
                  </div>
                }

                @if (dirtyIds.has(item.id)) {
                  <div class="pricing-card__actions">
                    <button class="btn btn--primary btn--sm" (click)="save(item)" [disabled]="saving()">
                      {{ saving() ? 'Сохранение...' : 'Сохранить' }}
                    </button>
                    <button class="btn btn--ghost btn--sm" (click)="discard(item)">Отмена</button>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <div class="pricing-formula">
          <h3>Формула итоговой цены</h3>
          <div class="formula">
            <span class="formula__part formula__part--material">Материалы</span>
            <span class="formula__op">+</span>
            <span class="formula__part formula__part--hardware">Фурнитура × кол-во полотен</span>
            <span class="formula__op">+</span>
            <span class="formula__part formula__part--frame">Рамка × периметр (м)</span>
            <span class="formula__op">=</span>
            <span class="formula__part formula__part--total">Итого</span>
          </div>
          <div class="formula-note">
            Материалы — площадь каждой секции × цена выбранного материала (€/м²), суммируется по всем секциям всех полотен.
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-page {
      padding: var(--space-xl);
      max-width: 800px;
      &__header { margin-bottom: var(--space-xl); h1 { font-family: var(--font-display); font-size: 28px; } }
    }
    .loading-center { display: flex; justify-content: center; padding: var(--space-3xl); }

    .pricing-info {
      background: var(--color-off-white);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-md) var(--space-lg);
      margin-bottom: var(--space-xl);
      font-size: 14px;
      color: var(--color-text-muted);
      line-height: 1.6;
      p { margin: 0; }
    }

    .pricing-cards {
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
      margin-bottom: var(--space-2xl);
    }

    .pricing-card {
      background: var(--color-white);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;

      &__header {
        padding: var(--space-md) var(--space-xl);
        background: var(--color-primary);
        color: var(--color-white);
      }

      &__label {
        font-family: var(--font-display);
        font-size: 16px;
        font-weight: 600;
      }

      &__sublabel {
        font-size: 12px;
        color: rgba(255,255,255,0.6);
        margin-top: 2px;
      }

      &__body {
        padding: var(--space-xl);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }

      &__actions {
        display: flex;
        gap: var(--space-sm);
        padding-top: var(--space-sm);
        border-top: 1px solid var(--color-border);
        margin-top: var(--space-sm);
      }
    }

    .price-field {
      display: flex;
      flex-direction: column;
      gap: 6px;

      &__label {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text);
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &__hint {
        font-size: 11px;
        font-weight: 400;
        color: var(--color-text-muted);
      }

      &__input-wrap {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
      }

      &__example {
        font-size: 12px;
        color: var(--color-text-muted);
        font-style: italic;
      }
    }

    .price-input {
      width: 140px;
    }

    .price-unit {
      font-size: 13px;
      color: var(--color-text-muted);
      white-space: nowrap;
    }

    .pricing-formula {
      background: var(--color-white);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);

      h3 {
        font-family: var(--font-display);
        font-size: 16px;
        margin-bottom: var(--space-md);
        color: var(--color-text);
      }
    }

    .formula {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      flex-wrap: wrap;
      margin-bottom: var(--space-md);

      &__op {
        font-size: 18px;
        font-weight: 300;
        color: var(--color-text-muted);
      }

      &__part {
        padding: 6px 12px;
        border-radius: var(--radius-sm);
        font-size: 13px;
        font-weight: 600;

        &--material { background: #e8f5e9; color: #2e7d32; }
        &--hardware { background: #e3f2fd; color: #1565c0; }
        &--frame    { background: #fff3e0; color: #e65100; }
        &--total    { background: var(--color-primary); color: var(--color-accent); }
      }
    }

    .formula-note {
      font-size: 12px;
      color: var(--color-text-muted);
      line-height: 1.6;
    }
  `],
})
export class AdminPricingComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly items = signal<HardwarePricingItem[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);

  readonly dirtyIds = new Set<string>();
  private originalValues = new Map<string, Partial<HardwarePricingItem>>();

  readonly examplePerimeter = 2 * ((2400 + 2200) / 1000); // 9.2

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getHardwarePricing().subscribe({
      next: (data) => {
        this.items.set(data);
        data.forEach((item) => {
          this.originalValues.set(item.id, {
            priceFixed: item.priceFixed,
            pricePerM: item.pricePerM,
          });
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  markDirty(id: string): void {
    this.dirtyIds.add(id);
  }

  discard(item: HardwarePricingItem): void {
    const orig = this.originalValues.get(item.id);
    if (orig) {
      item.priceFixed = orig.priceFixed ?? null;
      item.pricePerM = orig.pricePerM ?? null;
    }
    this.dirtyIds.delete(item.id);
    // Trigger change detection
    this.items.set([...this.items()]);
  }

  save(item: HardwarePricingItem): void {
    this.saving.set(true);
    const payload: Partial<Pick<HardwarePricingItem, 'priceFixed' | 'pricePerM'>> = {};
    if (item.priceFixed !== null) payload.priceFixed = Number(item.priceFixed);
    if (item.pricePerM !== null) payload.pricePerM = Number(item.pricePerM);

    this.api.updateHardwarePricing(item.id, payload).subscribe({
      next: (updated) => {
        this.originalValues.set(item.id, {
          priceFixed: updated.priceFixed,
          pricePerM: updated.pricePerM,
        });
        this.dirtyIds.delete(item.id);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
