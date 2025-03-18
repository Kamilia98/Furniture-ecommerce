import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { ButtonComponent } from '../button/button.component';
import { RouterModule } from '@angular/router';

import {
  trigger,
  transition,
  animate,
  style,
  state,
} from '@angular/animations';

import { FavoriteService } from '../../../Services/favorite.service';
import { CartService } from '../../../Services/cart.service';
import { product } from '../../../Models/product.model';
import { map, Observable } from 'rxjs';

import { NgToastModule, NgToastService } from 'ng-angular-popup';
import { ToasterPosition } from 'ng-angular-popup';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, ButtonComponent, RouterModule, NgToastModule],
  providers: [CurrencyPipe],
  templateUrl: './product-item.component.html',
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateY(0%)', opacity: 1 })),
      state('out', style({ transform: 'translateY(100%)', opacity: 0 })),
      transition('in <=> out', [animate('300ms ease-in-out')]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductItemComponent implements OnInit {
  @Input({ required: true }) product!: product;

  isHovered = false;
  disableAnimation = false;

  cart$!: Observable<product[]>;

  ToasterPosition = ToasterPosition;

  constructor(
    private cdr: ChangeDetectorRef,
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private toast: NgToastService
  ) {}
  ngOnInit(): void {
    this.cart$ = this.cartService.cart$;
    this.cartService.getCart().subscribe();
  }

  onMouseEnter() {
    if (!this.disableAnimation) this.isHovered = true;
  }

  onMouseLeave() {
    if (!this.disableAnimation) this.isHovered = false;
  }

  addToFavourites() {
    if (this.isFavorite(this.product.id)) {
      this.favoriteService.removeFavorite(this.product.id);
    } else {
      this.favoriteService.addFavorite(this.product);
    }
    this.cdr.detectChanges();
  }

  addToCart() {
    console.log(1);
    if (this.cartService.isInCart(this.product.id)) {
      this.cartService.removeProduct(this.product.id);
      this.toast.success(
        'Product removed Succeffully from cart',
        'SUCCESS',
        1000
      );
    } else {
      this.cartService.addProduct(this.product);
      this.toast.success('Product Added Succeffully to cart', 'SUCCESS', 1000);
    }
    this.cdr.detectChanges();
  }

  isNewProduct(): boolean {
    if (!this.product?.date) return false;
    const productDate = new Date(this.product.date).getTime();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return productDate > oneMonthAgo.getTime();
  }

  isFavorite(productId: string): boolean {
    return this.favoriteService.getFavorites().some((p) => p.id === productId);
  }

  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/images/products/1.png';
  }
}
