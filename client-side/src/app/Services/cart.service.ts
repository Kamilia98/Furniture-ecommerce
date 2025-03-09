import { Injectable } from '@angular/core';

import { product } from '../Models/product.model';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: product[] = [];
  private checkoutData: product[] = [];
  constructor(private productService: ProductService) {}

  getCart(userId: number): product[] {
    return [...this.cart];
  }

  addProduct(userId: number, product: product): void {
    if (this.cart.every((p) => p.id != product.id))
      this.cart.push({ ...product, quantity: 1 });
  }

  removeProduct(userId: number, productId: number): void {
    this.cart = this.cart.filter((p) => p.id !== productId);
  }

  //***** increase-button-service ******/
  increaseQuantity(productId: number): void {
    const product = this.cart.find((p) => p.id === productId);
    const stockProduct = this.getProductStock(productId);

    if (product && stockProduct && product.quantity < stockProduct.quantity) {
      product.quantity++;
    }
  }
  private getProductStock(productId: number): product | undefined {
    return this.productService.getProduct(productId);
  }

  //***** decrease-button-service ******/
  decreaseQuantity(productId: number): void {
    const product = this.cart.find((p) => p.id === productId);
    if (product && product.quantity > 1) {
      product.quantity--;
    }
  }
  //***** subtotal-service ******/
  getSubtotal(): number {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  //***** checkout services ******/
  setCheckoutData(): void {
    this.checkoutData = [...this.cart];
    // console.log("Checkout Data Set>>>>>>>>>>>", this.checkoutData);
  }

  getCheckoutData(): product[] {
    return [...this.checkoutData];
  }
}
