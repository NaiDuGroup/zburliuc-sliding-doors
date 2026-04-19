import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
  untracked,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, CommonModule, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SeoService } from '../../core/services/seo.service';
import { ApiService } from '../../core/services/api.service';
import { Material } from '../../core/models/material.model';
import {
  DoorConfiguration,
  PanelConfig,
  PriceBreakdown,
  SectionConfig,
} from '../../core/models/configurator.model';
import { CreateQuoteRequest } from '../../core/models/quote.model';

@Component({
  selector: 'app-configurator',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgStyle],
  templateUrl: './configurator.component.html',
  styleUrl: './configurator.component.scss',
})
export class ConfiguratorComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly api = inject(ApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly recalcSubject = new Subject<void>();

  readonly currentStep = signal(1);
  readonly materials = signal<Material[]>([]);
  readonly priceBreakdown = signal<PriceBreakdown | null>(null);
  readonly isCalculating = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitted = signal(false);
  readonly submitError = signal('');

  readonly openingWidth = signal(2400);
  readonly openingHeight = signal(2200);
  readonly panelCount = signal(3);
  readonly sectionsPerPanel = signal(2);

  readonly panels = signal<PanelConfig[]>([]);

  readonly clientName = signal('');
  readonly clientPhone = signal('');
  readonly clientEmail = signal('');
  readonly clientComment = signal('');

  readonly panelNumbers = computed(() =>
    Array.from({ length: this.panelCount() }, (_, i) => i),
  );

  readonly sectionNumbers = computed(() =>
    Array.from({ length: this.sectionsPerPanel() }, (_, i) => i),
  );

  readonly configuration = computed<DoorConfiguration>(() => ({
    openingWidth: this.openingWidth(),
    openingHeight: this.openingHeight(),
    panels: this.panels(),
  }));

  readonly canProceedStep1 = computed(
    () => this.openingWidth() >= 300 && this.openingHeight() >= 500,
  );

  readonly canProceedStep2 = computed(
    () => this.panelCount() >= 1 && this.sectionsPerPanel() >= 1,
  );

  readonly canProceedStep3 = computed(() =>
    this.panels().every((p) =>
      p.sections.every((s) => !!s.materialId),
    ),
  );

  readonly doorAspectRatio = computed(() => {
    const ratio = this.openingWidth() / this.openingHeight();
    return Math.min(Math.max(ratio, 0.4), 3);
  });

  /** Step 1: single frame. Step 2+: actual panel count */
  readonly previewPanels = computed(() =>
    this.currentStep() >= 2 ? this.panelNumbers() : [0],
  );

  /** Step 1: single section (count unknown yet). Step 2+: actual section count */
  readonly previewSections = computed(() =>
    this.currentStep() >= 2 ? this.sectionNumbers() : [0],
  );

  readonly widthError = computed(() => {
    const w = this.openingWidth();
    if (w < 300) return 'Минимум 300 мм';
    if (w > 10000) return 'Максимум 10 000 мм';
    return '';
  });

  readonly heightError = computed(() => {
    const h = this.openingHeight();
    if (h < 500) return 'Минимум 500 мм';
    if (h > 5000) return 'Максимум 5 000 мм';
    return '';
  });

  private readonly typeColors: Record<string, string> = {
    GLASS: 'linear-gradient(160deg, rgba(186,230,248,0.7) 0%, rgba(147,210,240,0.55) 100%)',
    MIRROR: 'linear-gradient(135deg, rgba(215,215,235,0.9) 0%, rgba(240,240,255,0.7) 40%, rgba(200,205,230,0.9) 100%)',
    WOOD: 'linear-gradient(160deg, #c8a97a 0%, #9a6b3c 100%)',
    LACOBEL: 'linear-gradient(160deg, #2d2d4e 0%, #1a1a32 100%)',
    ALUMINUM: 'linear-gradient(160deg, #d0d0d0 0%, #909090 100%)',
    FABRIC: 'linear-gradient(160deg, #d4c5b0 0%, #b8a48a 100%)',
    OTHER: 'linear-gradient(160deg, #d8d4cc 0%, #c0bcb4 100%)',
  };

  constructor() {
    effect(() => {
      const count = this.panelCount();
      const sections = this.sectionsPerPanel();
      untracked(() => this.buildPanels(count, sections));
    });

    this.recalcSubject
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(() => this.recalculate());
  }

  ngOnInit(): void {
    this.seo.update({
      title: 'Door Configurator',
      description:
        'Configure your custom sliding doors online. Choose dimensions, materials, and see your price instantly.',
    });
    if (isPlatformBrowser(this.platformId)) {
      this.api.getMaterials(1, 50).subscribe({
        next: (res) => this.materials.set(res.data),
        error: (err) => console.error('Failed to load materials', err),
      });
    }
  }

  private buildPanels(count: number, sections: number): void {
    const existing = this.panels();
    const newPanels: PanelConfig[] = Array.from({ length: count }, (_, pi) => {
      const existingPanel = existing[pi];
      const newSections: SectionConfig[] = Array.from(
        { length: sections },
        (__, si) => {
          const existingSection = existingPanel?.sections[si];
          return {
            materialId: existingSection?.materialId ?? '',
            colorValue: existingSection?.colorValue,
            heightRatio: 1 / sections,
          };
        },
      );
      return { sections: newSections };
    });
    this.panels.set(newPanels);
  }

  setMaterial(panelIdx: number, sectionIdx: number, materialId: string): void {
    const updated = this.panels().map((p, pi) => ({
      ...p,
      sections: p.sections.map((s, si) =>
        pi === panelIdx && si === sectionIdx
          ? { ...s, materialId, colorValue: '' }
          : s,
      ),
    }));
    this.panels.set(updated);
    this.recalcSubject.next();
  }

  setColor(panelIdx: number, sectionIdx: number, colorValue: string): void {
    const updated = this.panels().map((p, pi) => ({
      ...p,
      sections: p.sections.map((s, si) =>
        pi === panelIdx && si === sectionIdx ? { ...s, colorValue } : s,
      ),
    }));
    this.panels.set(updated);
  }

  applyToAllPanels(sectionIdx: number, materialId: string, colorValue: string): void {
    const updated = this.panels().map((p) => ({
      ...p,
      sections: p.sections.map((s, si) =>
        si === sectionIdx ? { ...s, materialId, colorValue } : s,
      ),
    }));
    this.panels.set(updated);
    this.recalcSubject.next();
  }

  copyPanelFrom(sourceIdx: number, targetIdx: number): void {
    const source = this.panels()[sourceIdx];
    if (!source) return;
    const updated = this.panels().map((p, pi) =>
      pi === targetIdx
        ? { ...p, sections: source.sections.map((s) => ({ ...s })) }
        : p,
    );
    this.panels.set(updated);
    this.recalcSubject.next();
  }

  hasMaterialsInPanel(panelIdx: number): boolean {
    return this.panels()[panelIdx]?.sections.some((s) => !!s.materialId) ?? false;
  }

  getMaterialById(id: string): Material | undefined {
    return this.materials().find((m) => m.id === id);
  }

  getMaterialColorOptions(materialId: string) {
    return this.getMaterialById(materialId)?.colorOptions ?? [];
  }

  getSectionMaterialId(panelIdx: number, sectionIdx: number): string {
    return this.panels()[panelIdx]?.sections[sectionIdx]?.materialId ?? '';
  }

  getSectionColorValue(panelIdx: number, sectionIdx: number): string {
    return this.panels()[panelIdx]?.sections[sectionIdx]?.colorValue ?? '';
  }

  getDoorSectionStyle(panelIdx: number, sectionIdx: number): Record<string, string> {
    const section = this.panels()[panelIdx]?.sections[sectionIdx];
    if (!section?.materialId) {
      return sectionIdx % 2 === 0
        ? { background: 'linear-gradient(160deg, #ede9e0 0%, #dcd8cf 100%)' }
        : { background: 'linear-gradient(160deg, #c8c4bc 0%, #b8b4ab 100%)' };
    }
    const material = this.getMaterialById(section.materialId);
    if (!material) return { background: '#e8e4dc' };

    // Color variant image has highest priority
    if (section.colorValue) {
      const colorOption = material.colorOptions.find(c => c.value === section.colorValue);
      if (colorOption?.imageUrl) {
        return {
          backgroundImage: `url(${colorOption.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
      if (colorOption?.hexColor) return { background: colorOption.hexColor };
    }

    // Fall back to material's default image
    if (material.imageUrl) {
      return {
        backgroundImage: `url(${material.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    return { background: this.typeColors[material.type] ?? '#d0d0d0' };
  }

  getMaterialThumbStyle(material: Material): Record<string, string> {
    if (material.imageUrl) {
      return {
        backgroundImage: `url(${material.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { background: this.typeColors[material.type] ?? '#d0d0d0' };
  }

  /** Card thumb for a specific section — switches to color variant image when one is selected */
  getSectionCardThumbStyle(panelIdx: number, sectionIdx: number, mat: Material): Record<string, string> {
    if (this.getSectionMaterialId(panelIdx, sectionIdx) === mat.id) {
      const colorValue = this.getSectionColorValue(panelIdx, sectionIdx);
      const colorOpt = mat.colorOptions.find(c => c.value === colorValue);
      if (colorOpt?.imageUrl) {
        return {
          backgroundImage: `url(${colorOpt.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
      if (colorOpt?.hexColor) return { background: colorOpt.hexColor };
    }
    return this.getMaterialThumbStyle(mat);
  }

  /** Color swatch shows thumbnail photo when available, hex circle as fallback */
  getColorSwatchStyle(color: { hexColor?: string; imageUrl?: string }): Record<string, string> {
    if (color.imageUrl) {
      return {
        backgroundImage: `url(${color.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { background: color.hexColor ?? '#ccc' };
  }

  nextStep(): void {
    if (this.currentStep() < 4) {
      this.currentStep.update((s) => s + 1);
      if (this.currentStep() === 4) {
        this.recalculate();
      }
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  goToStep(step: number): void {
    if (step < this.currentStep() || this.canGoToStep(step)) {
      this.currentStep.set(step);
    }
  }

  canGoToStep(step: number): boolean {
    if (step === 1) return true;
    if (step === 2) return this.canProceedStep1();
    if (step === 3) return this.canProceedStep1() && this.canProceedStep2();
    if (step === 4) return this.canProceedStep1() && this.canProceedStep2() && this.canProceedStep3();
    return false;
  }

  private recalculate(): void {
    if (!this.canProceedStep3()) return;
    this.isCalculating.set(true);
    this.api.calculatePrice(this.configuration()).subscribe({
      next: (breakdown) => {
        this.priceBreakdown.set(breakdown);
        this.isCalculating.set(false);
      },
      error: () => this.isCalculating.set(false),
    });
  }

  submitQuote(): void {
    if (!this.clientName() || !this.clientPhone()) return;
    this.isSubmitting.set(true);
    this.submitError.set('');

    const request: CreateQuoteRequest = {
      configuration: this.configuration(),
      clientName: this.clientName(),
      clientPhone: this.clientPhone(),
      clientEmail: this.clientEmail() || undefined,
      clientComment: this.clientComment() || undefined,
    };

    this.api.submitQuote(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.submitError.set('Ошибка при отправке. Попробуйте ещё раз.');
      },
    });
  }

  resetConfigurator(): void {
    this.currentStep.set(1);
    this.submitted.set(false);
    this.priceBreakdown.set(null);
    this.clientName.set('');
    this.clientPhone.set('');
    this.clientEmail.set('');
    this.clientComment.set('');
  }

  getPanelWidthMm(): number {
    return Math.round(this.openingWidth() / this.panelCount());
  }
}
