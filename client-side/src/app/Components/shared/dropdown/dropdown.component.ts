import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="absolute top-full right-0 z-10 mt-2 w-full min-w-max rounded-md bg-white p-2 shadow"
    >
      <ul class="flex flex-col">
        <li
          *ngFor="let item of normalizedItems"
          (click)="selectItem(item)"
          class="cursor-pointer rounded-md p-2 duration-300 ease-in-out hover:bg-secondary"
        >
          {{ item.value }}
        </li>
      </ul>
    </div>
  `,
})
export class DropdownComponent implements OnChanges {
  @Input() items: { id: string; value: string }[] | string[] = [];
  @Output() selectedValueChange = new EventEmitter<{
    id: string;
    value: string;
  }>();

  normalizedItems: { id: string; value: string }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.normalizedItems = this.items.map((item, index) =>
        typeof item === 'string' ? { id: String(index), value: item } : item,
      );
    }
  }

  selectItem(item: { id: string; value: string }) {
    this.selectedValueChange.emit(item);
  }
}
