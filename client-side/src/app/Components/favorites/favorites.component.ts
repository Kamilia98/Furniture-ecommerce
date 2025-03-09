import { Component } from '@angular/core';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';

import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../shared/button/button.component';
import { RouterModule } from '@angular/router';
import { FavoritesItemsComponent } from '../shared/favorites-items/favorites-items.component';

@Component({
  selector: 'app-favorites',
  imports: [
    HeaderBannerComponent,
    FeatureBannerComponent,
    CommonModule,
    RouterModule,
    FavoritesItemsComponent,
  ],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent {}
