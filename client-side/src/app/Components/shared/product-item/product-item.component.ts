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

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, ButtonComponent, RouterModule],
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

  constructor(
    private cdr: ChangeDetectorRef,
    private favoriteService: FavoriteService,
    private cartService: CartService
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
    this.favoriteService.toggleFavourite(this.product.id).subscribe({
      next: () => {
        console.log('Favorite toggled successfully');
        this.cdr.detectChanges(); // Trigger change detection
      },
      error: (err) => console.error('Error toggling favorite:', err),
    });
    this.cdr.detectChanges();
  }

  addToCart() {
    if (this.cartService.isInCart(this.product.id)) {
      this.cartService.removeProduct(this.product.id);
    } else {
      this.cartService.addProduct(this.product);
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

  isFavorite(productId: string): Observable<boolean> {
    return this.favoriteService
      .getFavourites()
      .pipe(map((favorites) => favorites.some((p) => p.id === productId)));
  }
  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/images/products/1.png';
  }
}
