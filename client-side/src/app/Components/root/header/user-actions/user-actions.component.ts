import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { trigger, transition, animate, style } from '@angular/animations';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { product } from '../../../../Models/product.model';
import { FavoriteService } from '../../../../Services/favorite.service';
import { CartService } from '../../../../Services/cart.service';
import { AuthService } from '../../../../Services/auth.service';
import { productCart } from '../../../../Models/productCart.model';

@Component({
  selector: 'app-user-actions',
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
  cartProductsTotalPrice!: Observable<number>;
  cartLength$!: Observable<number>;
  cart$!: Observable<productCart[]>;
  favoritesLength = 0;
  favModalShow = false;
  cartModalShow = false;
  isLoggedIn = false;

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });

    this.cartService.getCart().subscribe();
    this.cart$ = this.cartService.cart$;
    this.cartLength$ = this.cart$.pipe(map((cart) => cart.length));
    this.cartProductsTotalPrice = this.cartService.getSubtotal();
  }

  get favorites(): product[] {
    const favoritesItems = this.favoriteService.getFavorites();
    this.favoritesLength = favoritesItems.length;
    return favoritesItems.slice(0, 4);
  }

  deleteFavorite(id: string): void {
    this.favoriteService.removeFavorite(id);
  }

  deleteCartProduct(id: string): void {
    this.cartService.removeProduct(id);
  }

  toggleFavModal(open: boolean): void {
    this.favModalShow = open;
    this.toggleBodyScroll(open);
  }

  toggleCartModal(open: boolean): void {
    this.cartModalShow = open;
    this.toggleBodyScroll(open);
  }

  private toggleBodyScroll(isOpen: boolean): void {
    document.body.style.overflowY = isOpen ? 'hidden' : 'auto';
    document.body.style.width = isOpen ? 'calc(100% - 10px)' : '';
  }
}
