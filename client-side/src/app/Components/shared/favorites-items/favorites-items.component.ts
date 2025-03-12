import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { product } from '../../../Models/product.model';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../Services/cart.service';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { Observable, Subject, map } from 'rxjs';
import { FavoriteService } from '../../../Services/favorite.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-favorites-items',
  imports: [ButtonComponent, CommonModule, RouterModule],
  templateUrl: './favorites-items.component.html',
  styleUrl: './favorites-items.component.css',
})
export class FavoritesItemsComponent implements OnInit, OnDestroy {
  favorites$!: Observable<product[]>;
  cart$!: Observable<product[]>;
  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit(): void {
    this.cart$ = this.cartService.cart$;
    this.cartService.getCart().subscribe();
    // Load favorites
    this.favorites$ = this.favoriteService
      .getFavourites()
      .pipe(takeUntil(this.destroy$));
    this.favoriteService.loadFavorites().subscribe({
      next: () => console.log('Favorites loaded successfully'),
      error: (err) => console.error('Error loading favorites:', err),
    });
  }
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
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
  toggleFavorite(product: product): void {
    console.log('toggle clicked');
    
    this.favoriteService.toggleFavourite(product.id).subscribe({
      next: () => console.log('Favorite toggled successfully'),
      error: (err) => console.error('Error toggling favorite:', err),
    });
  }
}
