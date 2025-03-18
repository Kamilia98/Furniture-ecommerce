export interface product {
  id: string;
  images: string[];
  name: string;
  subTitle: string;
  price: number;
  categories: string[];
  date: Date;
  sale?: number;
  quantity: number;
  colors?: string[];
  sizes?: string[];
  brand?: string;
}
