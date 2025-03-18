import { Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-product-item-skeleton',
  imports: [NgxSkeletonLoaderModule],
  template: `
    <ngx-skeleton-loader
      count="1"
      [theme]="{
        'height.px': 300,
        'margin-bottom': 0
      }"
    />
    <div class="flex flex-col gap-0.5 pb-3">
      <ngx-skeleton-loader
        count="1"
        [theme]="{ 'width.%': 50, 'height.px': 24, 'margin-bottom': 0 }"
      />
      <ngx-skeleton-loader
        count="1"
        [theme]="{ 'width.%': 90, 'height.rem': 1.5, 'margin-bottom': 0 }"
      />
      <ngx-skeleton-loader
        count="1"
        [theme]="{ 'width.%': 90, 'height.rem': 1.5, 'margin-bottom': 0 }"
      />
      <ngx-skeleton-loader count="1" [theme]="{}" />
    </div>
  `,
})
export class ProductItemSkeletonComponent {}
