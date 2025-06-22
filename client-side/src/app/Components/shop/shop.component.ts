import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, animate, style } from '@angular/animations';
import { BehaviorSubject, Observable, combineLatest, forkJoin } from 'rxjs';

// Angular Material & CDK
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Components
import { FeatureBannerComponent } from '../shared/feature-banner/feature-banner.component';
import { HeaderBannerComponent } from '../shared/header-banner/header-banner.component';
import { DropdownComponent } from '../shared/dropdown/dropdown.component';
import { FilterOptionComponent } from './filter-option/filter-option.component';

import { ProductItemComponent } from '../shared/product-item/product-item.component';
import { PaginationComponent } from '../shared/pagination/pagination.component';

// Services
import { ProductService } from '../../Services/product.service';
import { CategoriesService } from '../../Services/categories.service';

// Models
import { Product } from '../../Models/product.model';
import { Category } from '../../Models/category.model';
import { ProductItemSkeletonComponent } from '../shared/product-item/product-item-skeleton/product-item-skeleton.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SearchComponent } from './search/search.component';
import { ActivatedRoute, Router } from '@angular/router';

// Enums
enum SortOptions {
  Default = 'Default',
  LowToHigh = 'Price: Low to High',
  HighToLow = 'Price: High to Low',
  Newest = 'Newest',
  Oldest = 'Oldest',
  AtoZ = 'Alphabetically: A to Z',
  ZtoA = 'Alphabetically: Z to A',
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    NgxSkeletonLoaderModule,
    TitleCasePipe,
    FeatureBannerComponent,
    HeaderBannerComponent,
    DropdownComponent,
    FilterOptionComponent,
    ProductItemComponent,
    PaginationComponent,
    ProductItemSkeletonComponent,
    SearchComponent,
  ],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('0.5s ease-out', style({ transform: 'translateX(0%)' })),
      ]),
      transition(':leave', [
        animate('0.5s ease-in', style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ],
})
export class ShopComponent implements OnInit {
  @ViewChild('productsContainer') productsContainer!: ElementRef;
  @ViewChild('sortMenu', { static: false }) sortMenuRef!: ElementRef;

  // UI State
  showFilters = true;
  showSortMenu = false;
  disableAnimation = false;

  // Product Data
  products$!: Observable<Product[]>;
  selectedCategories: string[] = [];
  private selectedSortValueSubject = new BehaviorSubject<SortOptions>(
    SortOptions.Default,
  );
  selectedSortValue$ = this.selectedSortValueSubject.asObservable();

  // Price Range
  priceMin!: number;
  priceMax!: number;
  minPrice!: number;
  maxPrice!: number;

  // Pagination
  productsPerPage = 8;
  currentPage = 1;
  totalProducts = 0;
  pagesCount = 0;

  // Skeleton Count
  skeletonArr = Array(this.productsPerPage);

  // Sorting
  sortMenuItems = Object.values(SortOptions);
  categories!: Category[];

  // Track loading state
  loading = true;

  constructor(
    private productService: ProductService,
    private categoriesService: CategoriesService,
    private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    console.log('Initializing ShopComponent');

    this.initializePriceRange();
    this.initializeCategories();
    this.onResize();

    // Wait for prices to be initialized first
    combineLatest([
      this.productService.getMinPrice(),
      this.productService.getMaxPrice(),
    ]).subscribe(([minPriceFromService, maxPriceFromService]) => {
      // Now handle query params
      this.route.queryParams.subscribe((params) => {
        this.currentPage = +params['page'] || 1;
        this.productsPerPage = +params['perPage'] || 9;
        this.selectedCategories = params['categories']
          ? params['categories'].split(',')
          : [];
        this.selectedSortValueSubject.next(params['sort'] || 'default');

        this.minPrice =
          params['minPrice'] !== undefined
            ? +params['minPrice']
            : Math.floor(minPriceFromService);
        this.maxPrice =
          params['maxPrice'] !== undefined
            ? +params['maxPrice']
            : Math.ceil(maxPriceFromService);

        this.products$ = this.productService.products$;
        this.fetchProducts();
      });
    });
  }

  private initializePriceRange() {
    forkJoin([
      this.productService.getMinPrice(),
      this.productService.getMaxPrice(),
    ]).subscribe(([min, max]) => {
      this.priceMin = min;
      this.priceMax = max;
    });
  }

  private initializeCategories(): void {
    this.categoriesService.getCategories().subscribe((categories) => {
      this.categories = categories;
    });
  }

  goToProduct(id: string) {
    this.router.navigate([`/product/${id}`]);
  }

  fetchProducts() {
    console.log('Fetching products...');
    this.loading = true;
    this.productService
      .getProducts(
        this.currentPage,
        this.productsPerPage,
        this.selectedCategories,
        this.selectedSortValueSubject.value,
        this.minPrice,
        this.maxPrice,
      )
      .subscribe({
        next: (data) => {
          console.log('Products fetched:', data);
          this.totalProducts = data.totalProducts;
          this.updatePagesCount();
          this.loading = false;
          this.router.navigate(['/shop'], {
            queryParams: {
              page: this.currentPage,
              perPage: this.productsPerPage,
              categories: this.selectedCategories.join(','),
              sort: this.selectedSortValueSubject.value,
              minPrice: this.minPrice,
              maxPrice: this.maxPrice,
            },
          });
        },
        error: (error) => {
          console.error('Error fetching products:', error);
          this.loading = false;
        },
      });
  }

  private updatePagesCount(): void {
    this.pagesCount = Math.ceil(this.totalProducts / this.productsPerPage);
    console.log(`Total pages updated: ${this.pagesCount}`);
  }

  onPriceChange(event: Event, isMin: boolean): void {
    const value = Number((event.target as HTMLInputElement).value);
    isMin
      ? (this.minPrice = Math.floor(Math.min(value, this.maxPrice - 1)))
      : (this.maxPrice = Math.ceil(Math.max(value, this.minPrice + 1)));
    console.log(
      `Price updated: Min - ${this.minPrice}, Max - ${this.maxPrice}`,
    );
    this.currentPage = 1;
    this.fetchProducts();
  }

  onSortChange(selectedItem: { id: string; value: string }): void {
    const sortOption = selectedItem.value as SortOptions;
    if (this.sortMenuItems.includes(sortOption)) {
      console.log(`Sorting by: ${sortOption}`);
      this.selectedSortValueSubject.next(sortOption);
      this.fetchProducts();
    }
    this.toggleDropdown(false);
  }

  onCategoryChange(category: Category, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedCategories = checked
      ? [...this.selectedCategories, category.id]
      : this.selectedCategories.filter((c) => c !== category.id);
    console.log(`Category selection changed: ${this.selectedCategories}`);
    this.currentPage = 1;
    this.fetchProducts();
  }

  getDisplayedResultsRange(): string {
    if (this.totalProducts === 0) return 'No results found';
    const start = (this.currentPage - 1) * this.productsPerPage + 1;
    const end = Math.min(
      this.currentPage * this.productsPerPage,
      this.totalProducts,
    );
    return `Showing ${start}-${end} of ${this.totalProducts} results`;
  }

  toggleShowFilter(open: boolean = !this.showFilters): void {
    this.showFilters = open;
    if (window.innerWidth < 1024) {
      this.renderer.setStyle(document.body, 'overflowY', open ? 'hidden' : '');
    }
  }

  toggleDropdown(open: boolean): void {
    this.showSortMenu = open;
  }

  isLgScreen(): boolean {
    return window.innerWidth >= 1024;
  }

  @HostListener('window:resize')
  onResize() {
    this.showFilters = this.isLgScreen();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.showSortMenu && this.sortMenuRef) {
      const clickedInsideMenu = this.sortMenuRef.nativeElement.contains(
        event.target,
      );
      if (!clickedInsideMenu) {
        this.showSortMenu = false;
      }
    }
  }
}
