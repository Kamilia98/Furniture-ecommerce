export interface ProductCart {
  id: string;
  image: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  color?: { name: string; hex: string };
}
