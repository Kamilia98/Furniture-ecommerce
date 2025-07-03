import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { Observable, map } from 'rxjs';
import { FavoriteService } from '../../../Services/favorite.service';
import { ProductFavorite } from '../../../Models/productFavorite.model';
@Component({
  selector: 'app-favorites-items',
  imports: [ButtonComponent, CommonModule, RouterModule],
  templateUrl: './favorites-items.component.html',
  host: {
    class: 'flex-1',
  },
})
export class FavoritesItemsComponent implements OnInit {
  favorites$!: Observable<ProductFavorite[]>;
  favoritesLength$!: Observable<number>;

  constructor(
    private cdr: ChangeDetectorRef,
    private favoriteService: FavoriteService,
  ) {}

  ngOnInit(): void {
    this.favorites$ = this.favoriteService.favorites$;
    this.favoritesLength$ = this.favoriteService.favorites$.pipe(
      map((favorites) => favorites.length),
    );
  }

  deleteFavorite(id: string): void {
    this.favoriteService.toggleFavourite(id).subscribe({
      next: () => {
        this.cdr.markForCheck();
      },
    });
  }
}
