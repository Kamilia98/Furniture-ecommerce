import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartTotalsComponent } from './cart-components/cart-totals/cart-totals.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { CartService } from '../../Services/cart.service';
import { take, switchMap, of } from 'rxjs';
import { StepperComponent } from '../shared/stepper/stepper.component';
import { Router } from '@angular/router';
import { ProductService } from '../../Services/product.service';
import { NgToastService } from 'ng-angular-popup';
import { ProductCart } from '../../Models/productCart.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CartTotalsComponent,
    HeaderBannerComponent,
    FeatureBannerComponent,
    CurrencyPipe,
    StepperComponent,
  ],
})
export class CartComponent implements OnInit {
  cart!: ProductCart[];
  cartLength!: number;

  constructor(
    private cartService: CartService,
    private router: Router,
    private productService: ProductService,
    private toast: NgToastService,
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe({
      next: (cart) => {
        this.cart = cart;
        this.cartLength = this.cart.length;
      },
    });
  }

  removeItem(itemId: string) {
    this.cartService.removeProduct(itemId);
  }

  increaseQuantity(item: ProductCart) {
    this.productService
      .getProduct(item.id)
      .pipe(
        take(1),
        switchMap((productDetails) => {
          if (productDetails && productDetails.colors) {
            const totalAvailableStock = productDetails.colors.reduce(
              (sum, color) => sum + color.quantity,
              0,
            );
            if (item.quantity < totalAvailableStock) {
              this.cartService.increaseQuantity(item.id);
            } else {
              this.toast.danger(
                `you have reached to available quantity for ${item.name}`,
              );
            }
          }
          return of(null);
        }),
      )
      .subscribe();
  }

  decreaseQuantity(id: string) {
    this.cartService.decreaseQuantity(id);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
