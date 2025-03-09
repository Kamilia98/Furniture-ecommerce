import { product } from './product.model';

export interface user {
  id: number;
  username: string;
  email: string;
  favorites: product[];
  cart: product[];
}
