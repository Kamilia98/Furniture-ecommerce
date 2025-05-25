import { AsyncPipe, CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { ProductService } from '../../Services/product.service';
import { ThumbnailComponent } from '../products-components/thumbnail/thumbnail.component';
import { ProductDescriptionComponent } from '../products-components/product-description/product-description.component';
import { ButtonComponent } from '../shared/button/button.component';
import { ProductDetails } from '../../Models/product-details.model';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProductItemComponent } from '../shared/product-item/product-item.component';
import { FavoriteService } from '../../Services/favorite.service';
import { CartService } from '../../Services/cart.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Product } from '../../Models/product.model';
import { ProductSkeletonComponent } from './product-skeleton/product-skeleton.component';
import { ProductItemSkeletonComponent } from '../shared/product-item/product-item-skeleton/product-item-skeleton.component';
import { ComparisonService } from '../../Services/comparison.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ThumbnailComponent,
    RouterModule,
    AsyncPipe,
    ProductDescriptionComponent,
    ProductItemComponent,
    ProductSkeletonComponent,
    ProductItemSkeletonComponent,
    ProductItemSkeletonComponent,
  ],
  templateUrl: './product.component.html',
})
export class ProductComponent implements OnInit {
  id!: string;
  private productSubject = new BehaviorSubject<ProductDetails | null>(null);
  product$ = this.productSubject.asObservable();
  relatedProducts$!: Observable<Product[]>;
  warningMessage: string | null = null;
  colors: {
    name: string;
    hex: string;
    mainImage?: string | null;
    galleryImages?: string[];
    quantity?: number;
    sku?: string;
  }[] = [];
  selectedColorIndex: number = 0;
  selectedImage!: string;
  selectedColor: {
    name: string;
    hex: string;
    mainImage?: string | null;
    galleryImages?: string[];
    quantity?: number;
    sku?: string;
  } | null = null;
  count: number = 1;
  originalPrice: number = 0;
  categories: string[] = [];
  salePrice: number = 0;
  isInCartState: boolean = false;
  isFavoriteState: boolean = false;

  private routeSub: Subscription = new Subscription();

  skeletonArr = Array(4);

  productLoading: boolean = true;
  productsLoading: boolean = true;
  btnWidth: string = '150px';

  constructor(
    private cdr: ChangeDetectorRef,
    private productService: ProductService,
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private comparisonService: ComparisonService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.btnWidth = window.innerWidth < 640 ? '340px' : '155px';
    this.routeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadProduct();
      }
    });

    this.cartService.cart$.subscribe(() => {
      this.isInCartState = this.cartService.isColorInCart(
        this.id,
        this.selectedColor?.hex ?? '',
      );
    });

    this.favoriteService.favorites$.subscribe(() => {
      this.isFavoriteState = this.favoriteService.isInFavorites(this.id);
    });

    this.loadProduct();
  }

  private updateCartStateForCurrentProduct(): void {
    this.isInCartState = this.cartService.isColorInCart(
      this.id,
      this.selectedColor?.hex ?? '',
    );
  }

  toggleFavorite() {
    this.favoriteService.toggleFavourite(this.id).subscribe();
  }

  getMappedProduct(product: ProductDetails): Product {
    return {
      id: product.id,
      name: product.name,
      image: this.selectedColor?.mainImage || 'default-image.jpg',
      subTitle: product.subtitle,
      price: this.salePrice,
      color: {
        hex: this.selectedColor?.hex ?? '',
        name: this.selectedColor?.name ?? '',
      },
      quantity: this.count,
      categories: product.categories || [],
      date: product.date,
      sale: product.sale,
      sizes: [],
      brand: product.brand,
    };
  }

  toggleCart() {
    const productDetails = this.productSubject.getValue();
    if (!productDetails || !this.selectedColor) {
      this.warningMessage = 'Please select a color first';
      return;
    }

    const product = this.getMappedProduct(productDetails);
    const colorName = this.selectedColor.name;
    console.log('Product price when toggling cart:', product.price);

    if (this.isInCartState) {
      this.cartService.removeColorVariant(product.id, colorName);
    } else {
      this.cartService.addProductWithColor(product, this.count);
    }
  }

  fetchProduct(id: string): Observable<ProductDetails> {
    return this.productService.getProduct(id).pipe(
      tap({
        next: (productData) => {
          if (productData) {
            this.count = 1;
            this.productSubject.next(productData);
            this.originalPrice = productData.price;
            this.categories = (productData.categories ?? []).map(
              ({ _id }) => _id,
            );
            this.salePrice =
              this.originalPrice * (1 - (productData.sale || 0) / 100);
            console.log('[product component] sale price', this.salePrice);

            this.colors = productData.colors || [];
            if (this.colors.length > 0) this.setSelectedColor(0);
            this.isInCartState = this.cartService.isInCart(productData.id);
            this.isFavoriteState = this.favoriteService.isInFavorites(
              productData.id,
            );
            console.log(
              '[ProductComponent -- fetch product] Categories:',
              this.categories,
            );
            this.productLoading = false;
            this.fetchProducts();
          } else {
            console.warn('[ProductComponent] No product data received.');
          }
        },
        error: (error) => {
          console.error('[ProductComponent] Error fetching product:', error);
          this.productLoading = false;
        },
      }),
    );
  }

  // related products
  fetchProducts() {
    this.productService.getProducts(1, 4, this.categories).subscribe({
      next: (response) => {
        this.productsLoading = false;
      },
      error: (error) => {
        console.error(
          '[ProductComponent] Error fetching related products:',
          error,
        );
        this.productsLoading = false;
      },
    });
  }
  loadProduct(): void {
    this.productLoading = true;
    this.productsLoading = true;
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.id) {
      this.fetchProduct(this.id).subscribe(() => {
        console.log('[ProductComponent] Product data fetched successfully.');
        this.relatedProducts$ = this.productService.products$;
      });
    } else {
      console.error('Product ID not found in route parameters.');
    }
  }

  setSelectedColor(index: number) {
    this.selectedColorIndex = index;
    this.selectedImage = this.colors[index]?.mainImage || 'default-image.jpg';
    this.selectedColor = this.colors[this.selectedColorIndex];
    this.updateCartStateForCurrentProduct();
  }

  selectThumbnail(image: string) {
    this.selectedImage = image;
  }

  selectColor(color: {
    name: string;
    hex: string;
    mainImage?: string | null;
    galleryImages?: string[];
  }) {
    const index = this.colors.findIndex((c) => c.hex === color.hex);
    if (index !== -1) {
      this.setSelectedColor(index);
    }
  }

  get stockStatus(): string {
    return this.selectedColor?.quantity && this.selectedColor.quantity > 0
      ? 'In Stock'
      : 'Out of Stock';
  }

  stringify(obj: any): string {
    return JSON.stringify(obj);
  }

  increase() {
    if (
      this.selectedColor?.quantity &&
      this.count < this.selectedColor.quantity
    ) {
      this.count++;
      this.warningMessage = null;
    } else {
      this.warningMessage = 'You have reached the maximum available quantity!';
    }
  }

  decrease() {
    if (
      this.count > 1 &&
      this.selectedColor?.quantity &&
      this.count <= this.selectedColor.quantity
    ) {
      this.warningMessage = null;
      this.count--;
    }
  }
  onAddToComparison() {
    if (this.product$) {
      const currentProduct = this.productSubject.getValue();
      if (currentProduct) {
        console.log('Adding to comparison:', currentProduct.id);
      }
      // Use the existing ComparisonService to handle adding to the comparison
      if (currentProduct) {
        this.comparisonService.addToComparison(
          currentProduct.id,
          currentProduct.name,
        );
      }
    }
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }
}
