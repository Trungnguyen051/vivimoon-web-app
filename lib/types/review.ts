export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number; // 0–5
  title: string;
  body: string;
  createdAt: string; // ISO date
  hasImages: boolean;
}
