export interface HardwarePricingItem {
  id: string;
  key: string;
  labelI18n: Record<string, string>;
  priceFixed: number | null;   // fixed price per unit (e.g. per panel)
  pricePerM: number | null;    // price per linear meter (e.g. frame)
  isActive: boolean;
}
