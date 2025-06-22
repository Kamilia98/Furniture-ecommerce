import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { DropdownComponent } from '../../shared/dropdown/dropdown.component';
import { ProductService } from '../../../Services/product.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent],
  template: `
    <div
      class="relative flex h-full w-full flex-1 cursor-pointer items-center rounded-md border border-gray-medium bg-white p-1"
    >
      <input
        type="text"
        class="w-full focus:outline-none"
        placeholder="Search products..."
        [(ngModel)]="searchValue"
        (focus)="toggleDropdown(true)"
        (input)="onSearchInput()"
        (keydown)="handleKeyDown($event)"
      />
      <img src="icons/search.svg" alt="Search" class="w-5" />
      @if (isMenuOpen && filteredItems.length > 0) {
        <app-dropdown
          [items]="filteredItems"
          (selectedValueChange)="updateValue($event)"
        ></app-dropdown>
      }
    </div>
  `,
  host: {
    '(document:click)': 'onClickOutside($event)',
  },
})
export class SearchComponent {
  @Output() onSelect = new EventEmitter<string>();

  searchValue: string = '';
  filteredItems: { id: string; value: string }[] = [];
  isMenuOpen: boolean = false;

  private searchSubject = new Subject<string>();
  private selectedIndex: number = -1;

  constructor(
    private elementRef: ElementRef,
    private productService: ProductService,
  ) {
    this.searchSubject
      .pipe(
        debounceTime(300),
        switchMap((query) => this.productService.searchProducts(query)),
      )
      .subscribe((results) => {
        this.filteredItems = results;
        this.selectedIndex = -1;
      });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchValue);
  }

  updateValue(item: any): void {
    this.searchValue = item.value;
    this.toggleDropdown(false);
    this.onSelect.emit(item.id);
  }

  toggleDropdown(open: boolean): void {
    this.isMenuOpen = open;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isMenuOpen || this.filteredItems.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        this.selectedIndex =
          (this.selectedIndex + 1) % this.filteredItems.length;
        break;
      case 'ArrowUp':
        this.selectedIndex =
          (this.selectedIndex - 1 + this.filteredItems.length) %
          this.filteredItems.length;
        break;
      case 'Enter':
        if (this.selectedIndex >= 0) {
          this.updateValue(this.filteredItems[this.selectedIndex]);
        }
        break;
      case 'Escape':
        this.toggleDropdown(false);
        break;
    }
  }

  onClickOutside(event: Event) {
    if (
      this.isMenuOpen &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.isMenuOpen = false;
    }
  }
}
