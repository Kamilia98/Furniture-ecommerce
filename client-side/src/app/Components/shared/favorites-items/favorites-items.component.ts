import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { product } from '../../../Models/product.model';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../Services/cart.service';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { Observable, map } from 'rxjs';
import { FavoriteService } from '../../../Services/favorite.service';
@Component({
  selector: 'app-favorites-items',
  imports: [ButtonComponent, CommonModule, RouterModule],
  templateUrl: './favorites-items.component.html',
  styleUrl: './favorites-items.component.css',
})
export class FavoritesItemsComponent implements OnInit {
  favorites: product[] = [];
  cart$!: Observable<product[]>;

  constructor(
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private favouriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    this.cart$ = this.cartService.cart$;
    this.cartService.getCart().subscribe();
    this.favorites = this.favouriteService.getFavorites();
  }

  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  addToCart(product: product) {
    if (this.isInCart(product.id)) {
      this.cartService.removeProduct(product.id);
    } else {
      this.cartService.addProduct(product);
    }
    this.cdr.detectChanges();
  }
}
