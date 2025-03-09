import { ChangeDetectorRef, Component } from '@angular/core';
import { product } from '../../../Models/product.model';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../Services/cart.service';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-favorites-items',
  imports: [ButtonComponent, CommonModule, RouterModule],
  templateUrl: './favorites-items.component.html',
  styleUrl: './favorites-items.component.css',
})
export class FavoritesItemsComponent {
  favorites: product[] = [];
  constructor(
    private cdr: ChangeDetectorRef,
    private cartService: CartService
  ) {}

  addToCart(product: product) {
    if (this.isInCart(product.id)) {
      this.cartService.removeProduct(1, product.id);
    } else {
      this.cartService.addProduct(1, product);
    }
    this.cdr.detectChanges();
  }

  isInCart(productID: number): boolean {
    return this.cartService.getCart(1).some((p) => p.id === productID);
  }
}
