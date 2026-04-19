export type MaterialType =
  | 'GLASS'
  | 'WOOD'
  | 'MIRROR'
  | 'LACOBEL'
  | 'ALUMINUM'
  | 'FABRIC'
  | 'OTHER';

export interface ColorOption {
  value: string;
  labelI18n: Record<string, string>;
  hexColor?: string;
  imageUrl?: string;
}

export interface Material {
  id: string;
  slug: string;
  nameI18n: Record<string, string>;
  descI18n: Record<string, string>;
  type: MaterialType;
  pricePerM2: number;
  colorOptions: ColorOption[];
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
