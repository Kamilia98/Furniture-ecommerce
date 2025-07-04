import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';
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
import { Product } from '../../../Models/product.model';
import { ComparisonService } from '../../../Services/comparison.service';

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, ButtonComponent, RouterModule],
  templateUrl: './product-item.component.html',
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateY(0%)', opacity: 1 })),
      state(
        'out',
        style({ transform: 'translateY(100%)', opacity: 0, display: 'none' }),
      ),
      transition('in <=> out', [animate('300ms ease-in-out')]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class ProductItemComponent implements OnInit {
  @Input({ required: true }) product!: Product;

  isHovered = false;
  showActions = false;

  isInCartState = false;
  isFavoriteState = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private ComparisonService: ComparisonService,
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe((cart) => {
      this.isInCartState = cart.some((item) => item.id === this.product.id);
      this.cdr.markForCheck();
    });

    this.favoriteService.favorites$.subscribe((favorites) => {
      this.isFavoriteState = favorites.some(
        (fav) => fav.id === this.product.id,
      );
      this.cdr.markForCheck();
    });
  }

  toggleFavourites(): void {
    this.favoriteService.toggleFavourite(this.product.id).subscribe();
  }

  toggleCart(): void {
    if (this.isInCartState) {
      this.cartService.removeProduct(this.product.id);
    } else {
      this.cartService.addProduct(this.product);
    }
  }

  onMouseEnter(): void {
    if (!this.showActions) {
      this.isHovered = true;
      this.cdr.markForCheck();
    }
  }

  onMouseLeave(): void {
    if (!this.showActions) {
      this.isHovered = false;
      this.cdr.markForCheck();
    }
  }

  isNewProduct(): boolean {
    if (!this.product?.date) return false;
    const date = new Date(this.product.date).getTime();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return date > oneMonthAgo.getTime();
  }

  onAddToComparison(): void {
    if (this.product) {
      console.log('Adding to comparison:', this.product.id);
      this.ComparisonService.addToComparison(
        this.product.id,
        this.product.name,
      );
    }
  }
}
