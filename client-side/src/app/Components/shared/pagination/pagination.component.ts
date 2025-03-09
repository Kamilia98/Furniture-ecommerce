import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-pagination',
  imports: [ButtonComponent, CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() pagesCount: number = 1;
  @Output() currentPageChange = new EventEmitter<number>();

  goToPage(page: number): void {
    if (page >= 1 && page <= this.pagesCount) {
      this.currentPageChange.emit(page);
    }
  }
}
