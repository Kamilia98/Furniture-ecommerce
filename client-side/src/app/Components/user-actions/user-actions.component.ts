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
      console.log(status);
      this.isLoggedIn = status;
      console.log(status);
    });

    this.cart$ = this.cartService.cart$;
    this.cartService.getCart().subscribe();
    this.cartLength$ = this.cartService.cart$.pipe(map((cart) => cart.length));
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
