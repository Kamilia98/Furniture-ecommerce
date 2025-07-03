import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { ComparisonService } from '../../Services/comparison.service';
import { ProductDetails } from '../../Models/product-details.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comparison',
  imports: [HeaderBannerComponent, CommonModule],
  templateUrl: './comparison.component.html',
})
export class ComparisonComponent implements OnInit {
  comparisonProducts: ProductDetails[] = [];
  colors: {
    name: string;
    hex: string;
    mainImage?: string | null;
    galleryImages?: string[];
    quantity?: number;
    sku?: string;
  }[] = [];
  loading: boolean = false;
  constructor(
    public comparisonService: ComparisonService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadComparisonProducts();
  }

  private loadComparisonProducts(): void {
    this.loading = true;
    this.comparisonService.getComparisonProducts().subscribe({
      next: (products) => {
        // Filter out null products and duplicates
        this.comparisonProducts = products.filter(
          (p, index, self) =>
            p && index === self.findIndex((t) => t.id === p.id),
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading comparison products:', err);
        this.loading = false;
      },
    });
  }
  getMainImage(product: any): string {
    const defaultImage = 'assets/images/placeholder.png';
    const mainImage = product.colors?.[0]?.mainImage;

    // mainImage could be string or string[], ensure fallback
    if (Array.isArray(mainImage) && mainImage.length > 0) {
      return mainImage[0];
    } else if (typeof mainImage === 'string') {
      return mainImage;
    } else if (product.colors?.[0]?.galleryImages?.[0]) {
      return product.colors[0].galleryImages[0];
    }
    return defaultImage;
  }

  // In ComparisonComponent
  removeProduct(id: string, name: string): void {
    this.comparisonService.removeFromComparison(id, name);
    // Force reload comparison products
    this.loadComparisonProducts();
  }

  handleAddProduct(): void {
    if (!this.comparisonService.isComparisonFull()) {
      this.router.navigate(['/shop']);
    }
  }
}
