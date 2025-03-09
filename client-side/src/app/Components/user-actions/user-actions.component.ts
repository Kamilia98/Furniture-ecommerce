import { Component, OnInit } from '@angular/core';
import { product } from '../../Models/product.model';
import { CurrencyPipe } from '@angular/common';
import { trigger, transition, animate, style } from '@angular/animations';
import { Router, RouterModule } from '@angular/router';
import { FavoriteService } from '../../Services/favorite.service';
import { CartService } from '../../Services/cart.service';

import { AuthService } from '../../Services/auth.service';

import { UserService } from '../../Services/user.service';

@Component({
  selector: 'app-user-actions',
  imports: [CurrencyPipe, RouterModule],
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
  cartLength = 0;
  favoritesLength = 0;
  favModalShow = false;
  cartModalShow = false;
  isLoggedIn = false;

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  get cart(): product[] {
    const cartItems = this.cartService.getCart(1);
    this.cartLength = cartItems.length;
    this.cartProductsTotalPrice = cartItems.reduce(
      (total, item) => total + item.price,
      0
    );
    return cartItems.slice(0, 4);
  }

  get favorites(): product[] {
    const favoritesItems = this.favoriteService.getFavorites(1);
    this.favoritesLength = favoritesItems.length;
    return favoritesItems.slice(0, 4);
  }

  deleteFavorite(id: number): void {
    this.favoriteService.removeFavorite(1, id);
  }

  deleteCartProduct(id: number): void {
    this.cartService.removeProduct(1, id);
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
