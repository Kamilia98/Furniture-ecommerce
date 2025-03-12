import { Component, OnInit } from '@angular/core';
import { product } from '../../Models/product.model';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { trigger, transition, animate, style } from '@angular/animations';
import { RouterModule } from '@angular/router';
import { FavoriteService } from '../../Services/favorite.service';
import { CartService } from '../../Services/cart.service';
import { AuthService } from '../../Services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-user-actions',
  standalone: true,
  imports: [CurrencyPipe, RouterModule, CommonModule],
  templateUrl: './user-actions.component.html',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate(
          '0.5s cubic-bezier(.4,0,.2,1)',
          style({ transform: 'translateX(0%)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '0.5s cubic-bezier(.4,0,.2,1)',
          style({ transform: 'translateX(100%)' })
        ),
      ]),
    ]),
  ],
})
export class UserActionsComponent implements OnInit {
  cartProductsTotalPrice = 0;
  cartLength$!: Observable<number>;
  cart$!: Observable<product[]>;
  favoritesLength$!: Observable<number>;
  favorites$!: Observable<product[]>;
  favModalShow = false;
  cartModalShow = false;
  isLoggedIn = false;

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication status
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });

    // Initialize cart data
    this.cart$ = this.cartService.cart$;
    this.cartService.getCart().subscribe();
    this.cartLength$ = this.cartService.cart$.pipe(map((cart) => cart.length));

    // Initialize favorites data
    this.favorites$ = this.favoriteService.getFavourites();
    this.favoritesLength$ = this.favorites$.pipe(
      map((favorites) => favorites.length)
    );
    this.favoriteService.loadFavorites().subscribe();
  }

  /**
   * Deletes a favorite product.
   * @param id - The ID of the product to remove from favorites.
   */
  deleteFavorite(id: string): void {
    this.favoriteService.toggleFavourite(id).subscribe({
      next: () => console.log('Favorite removed successfully'),
      error: (err) => console.error('Error removing favorite:', err),
    });
  }

  /**
   * Deletes a product from the cart.
   * @param id - The ID of the product to remove from the cart.
   */
  deleteCartProduct(id: string): void {
    this.cartService.removeProduct(id);
  }

  /**
   * Toggles the favorites modal.
   * @param open - Whether to open or close the modal.
   */
  toggleFavModal(open: boolean): void {
    this.favModalShow = open;
    this.toggleBodyScroll(open);
  }

  /**
   * Toggles the cart modal.
   * @param open - Whether to open or close the modal.
   */
  toggleCartModal(open: boolean): void {
    this.cartModalShow = open;
    this.toggleBodyScroll(open);
  }

  /**
   * Toggles body scroll based on modal state.
   * @param isOpen - Whether a modal is open.
   */
  private toggleBodyScroll(isOpen: boolean): void {
    document.body.style.overflowY = isOpen ? 'hidden' : 'auto';
    document.body.style.width = isOpen ? 'calc(100% - 10px)' : '';
  }
}
