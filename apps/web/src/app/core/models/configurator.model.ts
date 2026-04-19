export interface SectionConfig {
  materialId: string;
  colorValue?: string;
  heightRatio: number;
}

export interface PanelConfig {
  sections: SectionConfig[];
}

export interface DoorConfiguration {
  openingWidth: number;
  openingHeight: number;
  panels: PanelConfig[];
}

export interface PriceBreakdown {
  totalPrice: number;
  materialsPrice: number;
  hardwarePrice: number;
  framePrice: number;
  currency: string;
}

export interface ConfiguratorStep {
  id: number;
  labelKey: string;
  completed: boolean;
}

export const CONFIGURATOR_STEPS: ConfiguratorStep[] = [
  { id: 1, labelKey: 'configurator.steps.dimensions', completed: false },
  { id: 2, labelKey: 'configurator.steps.panels', completed: false },
  { id: 3, labelKey: 'configurator.steps.materials', completed: false },
  { id: 4, labelKey: 'configurator.steps.summary', completed: false },
];
