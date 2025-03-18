import {
  ChangeDetectorRef,
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
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

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
import { product } from '../../Models/product.model';
import { category } from '../../Models/category.model';
import { ProductItemSkeletonComponent } from '../shared/product-item/product-item-skeleton/product-item-skeleton.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

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
  showFilters = false;
  showSortMenu = false;
  disableAnimation = false;

  // Product Data
  products$!: Observable<product[]>;
  selectedCategories: string[] = [];
  private selectedSortValueSubject = new BehaviorSubject<SortOptions>(
    SortOptions.Default
  );
  selectedSortValue$ = this.selectedSortValueSubject.asObservable();

  // Price Range
  priceMin$!: Observable<number>;
  priceMax$!: Observable<number>;
  minPrice!: number;
  maxPrice!: number;

  // Pagination
  productsPerPage = 5;
  currentPage = 1;
  totalProducts = 0;
  pagesCount = 0;

  // Skeleton Count
  skeletonArr = Array(this.productsPerPage);

  // Sorting
  sortMenuItems = Object.values(SortOptions);
  categories$!: Observable<category[]>;
  categoriesNames$!: Observable<string[]>;

  // Track loading state
  loading = true;

  constructor(
    private productService: ProductService,
    private categoriesService: CategoriesService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    console.log('Initializing ShopComponent');
    this.products$ = this.productService.products$;
    this.fetchProducts();
    this.initializePriceRange();
    this.initializeCategories();
    this.checkScreenSize();
  }

  private initializePriceRange() {
    this.priceMin$ = this.productService.getMinPrice();
    this.priceMax$ = this.productService.getMaxPrice();
    combineLatest([this.priceMin$, this.priceMax$]).subscribe(([min, max]) => {
      console.log(`Price range initialized: ${min} - ${max}`);
      this.minPrice = min;
      this.maxPrice = max;
    });
  }

  private initializeCategories() {
    this.categories$ = this.categoriesService.categories$;
    this.categoriesNames$ = this.categories$.pipe(
      map((categories) => categories.map((cat) => cat.name))
    );
    this.categoriesService.getCategories().subscribe();
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
        this.maxPrice
      )
      .subscribe({
        next: (response) => {
          console.log('Products fetched:', response.data);
          this.totalProducts = response.data.totalProducts;
          this.updatePagesCount();
          this.loading = false;
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
      ? (this.minPrice = Math.min(value, this.maxPrice - 1))
      : (this.maxPrice = Math.max(value, this.minPrice + 1));
    console.log(
      `Price updated: Min - ${this.minPrice}, Max - ${this.maxPrice}`
    );
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

  onCategoryChange(category: category, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedCategories = checked
      ? [...this.selectedCategories, category.id]
      : this.selectedCategories.filter((c) => c !== category.id);
    console.log(`Category selection changed: ${this.selectedCategories}`);
    this.fetchProducts();
  }

  getDisplayedResultsRange(): string {
    if (this.totalProducts === 0) return 'No results found';
    const start = (this.currentPage - 1) * this.productsPerPage + 1;
    const end = Math.min(
      this.currentPage * this.productsPerPage,
      this.totalProducts
    );
    return `Showing ${start}-${end} of ${this.totalProducts} results`;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagesCount) {
      console.log(`Navigating to page: ${page}`);
      this.currentPage = page;
      this.fetchProducts();
      this.scrollToProducts();
    }
  }

  private scrollToProducts(): void {
    if (this.productsContainer) {
      const offset = 100;
      const topPosition =
        this.productsContainer.nativeElement.getBoundingClientRect().top +
        window.scrollY -
        offset;
      window.scrollTo({ top: topPosition, behavior: 'smooth' });
    }
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

  @HostListener('window:resize')
  checkScreenSize(): void {
    this.disableAnimation = window.innerWidth >= 1024;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.showSortMenu && this.sortMenuRef) {
      const clickedInsideMenu = this.sortMenuRef.nativeElement.contains(
        event.target
      );
      if (!clickedInsideMenu) {
        this.showSortMenu = false;
      }
    }
  }
}
