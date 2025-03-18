import { product } from './product.model';

export interface user {
  id: string;
  name: string;
  email: string;
  favorites?: product[];
  cart?: product[];
}
