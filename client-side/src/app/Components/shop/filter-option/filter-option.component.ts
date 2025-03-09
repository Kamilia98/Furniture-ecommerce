import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  trigger,
  transition,
  animate,
  style,
  state,
} from '@angular/animations';

@Component({
  selector: 'app-filter-option',
  imports: [CommonModule],
  animations: [
    trigger('slideUpDown', [
      state('in', style({ height: '*', opacity: 1 })),
      state('out', style({ height: '0', opacity: 0 })),
      transition('in <=> out', animate('200ms ease-in')),
    ]),
  ],
  template: `
    <div class="border-t border-gray-medium z-3 overflow-hidden">
      <div
        class="flex items-center justify-between py-3 cursor-pointer"
        (click)="toggleActive()"
      >
        <div>
          <span class="text-lg font-bold">{{ title }}</span>
        </div>
        <div class="w-[15px]">
          <img
            src="icons/arrow.svg"
            class="rotate-[90deg] duration-300 ease"
            [ngClass]="{ 'rotate-[270deg]': isActive }"
            alt=""
          />
        </div>
      </div>
      <div class="overflow-hidden" [@slideUpDown]="isActive ? 'in' : 'out'">
        <div class="optionsMenu">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class FilterOptionComponent {
  @Input() title: string = '';
  isActive: boolean = false;

  toggleActive() {
    this.isActive = !this.isActive;
  }
}
