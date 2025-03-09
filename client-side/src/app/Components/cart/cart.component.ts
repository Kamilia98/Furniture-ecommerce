import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartTotalsComponent } from './cart-components/cart-totals/cart-totals.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { CartService } from '../../Services/cart.service';
import { product } from '../../Models/product.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CartTotalsComponent,
    HeaderBannerComponent,
    FeatureBannerComponent,
    CurrencyPipe,
  ],
})
export class CartComponent implements OnInit {
  cart: product[] = [];
  // defQuantity:number=1;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart(1);
  }

  get subtotal(): number {
    return this.cartService.getSubtotal();
  }

  updateQuantity(item: product, quantity: number) {
    item.quantity = quantity;
  }

  removeItem(itemId: number) {
    this.cartService.removeProduct(1, itemId);
    this.cart = this.cartService.getCart(1);
  }

  increaseQuantity(productId: number) {
    this.cartService.increaseQuantity(productId);
    this.cart = this.cartService.getCart(1);
  }

  decreaseQuantity(productId: number) {
    this.cartService.decreaseQuantity(productId);
    this.cart = this.cartService.getCart(1);
  }
}
