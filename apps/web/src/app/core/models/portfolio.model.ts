export interface PortfolioItem {
  id: string;
  slug: string;
  titleI18n: Record<string, string>;
  descI18n: Record<string, string>;
  imageUrls: string[];
  coverImage: string;
  tags: string[];
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
