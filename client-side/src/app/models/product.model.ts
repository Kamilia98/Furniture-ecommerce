export interface product {
  id: number;
  img: string;
  title: string;
  description: string;
  price: number;
  category: string;
  date: Date;
  sale?: number | false;
  quantity: number;
}
