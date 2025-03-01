import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="absolute top-full left-0 bg-white w-full rounded-md p-2 mt-2 z-10"
    >
      <ul class="flex flex-col">
        <li
          *ngFor="let item of normalizedItems"
          (click)="selectItem(item)"
          class="p-2 duration-300 ease-in-out cursor-pointer rounded-md hover:bg-secondary"
        >
          {{ item.value }}
        </li>
      </ul>
    </div>
  `,
})
export class DropdownComponent {
  @Input() items: { id: number; value: string }[] | string[] = [];
  @Output() selectedValueChange = new EventEmitter<string>();

  /** Convert all items to a unified structure */
  get normalizedItems(): { id: number; value: string }[] {
    return this.items.map((item, index) =>
      typeof item === 'string' ? { id: index, value: item } : item
    );
  }

  /** Emits only the string value */
  selectItem(item: { id: number; value: string }) {
    this.selectedValueChange.emit(item.value);
  }
}
