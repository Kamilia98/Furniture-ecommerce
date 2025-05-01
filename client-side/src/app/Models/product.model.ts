export interface Product {
  id: string;
  image: string;
  name: string;
  subTitle: string;
  price: number;
  categories: string[];
  date: Date;
  sale?: number;
  quantity: number;
  color: { name: string; hex: string };
  sizes?: string[];
  brand?: string;
}
