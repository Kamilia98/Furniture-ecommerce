import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DropdownComponent } from '../shared/dropdown/dropdown.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent],
  template: `
    <div
      class="relative flex h-full w-48 cursor-pointer items-center rounded-md border border-gray-medium bg-white p-1"
    >
      <!-- Search Input -->
      <input
        type="text"
        class="w-full focus:outline-none"
        [(ngModel)]="searchValue"
        (focus)="toggleDropdown(true)"
        (input)="onSearchInput()"
        (keydown)="handleKeyDown($event)"
      />

      <!-- Search Icon -->
      <img src="icons/search.svg" alt="Search" class="w-5" />

      <!-- Dropdown -->
      @if(isMenuOpen && filteredItems.length > 0){
      <app-dropdown
        [items]="filteredItems"
        (selectedValueChange)="updateValue($event)"
      ></app-dropdown>
      }
    </div>
  `,
})
export class SearchComponent {
  @Input() items: { id: number; value: string }[] = [];
  @Output() onSelect = new EventEmitter<number>();

  searchValue: string = '';
  filteredItems: { id: number; value: string }[] = [];
  isMenuOpen: boolean = false;

  private searchSubject = new Subject<string>();
  private selectedIndex: number = -1;

  constructor(private elementRef: ElementRef) {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.filterSearchResults();
    });
  }

  /** Handles search input with debounce */
  onSearchInput(): void {
    this.searchSubject.next(this.searchValue);
  }

  /** Filters search results based on input */
  private filterSearchResults(): void {
    const query = this.searchValue.toLowerCase().trim();
    this.filteredItems = query
      ? this.items
          .filter((item) => item.value.toLowerCase().includes(query))
          .slice(0, 5)
      : [];
    this.selectedIndex = -1;
  }

  /** Updates input value and emits selected event */
  updateValue(item: any): void {
    this.searchValue = item.value;
    this.toggleDropdown(false);
    this.onSelect.emit(item.id);
  }

  /** Toggles dropdown visibility */
  toggleDropdown(open: boolean): void {
    this.isMenuOpen = open;
  }

  /** Handles arrow key navigation */
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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (
      this.isMenuOpen &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.isMenuOpen = false;
    }
  }
}
