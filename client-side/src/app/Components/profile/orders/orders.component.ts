import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../Services/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from '../../shared/dropdown/dropdown.component';

interface Order {
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  imports: [CommonModule, FormsModule, DropdownComponent],
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  displayedOrders: Order[] = [];

  pendingChecked = false;
  succeededChecked = false;
  pageSizesMenuOpen = false;

  totalItems = 0;
  itemsPerPage = '10';
  pageSizes = ['10', '20', '50', '100'];
  currentPage = 1;

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredOrders.length / +this.itemsPerPage)
    );
  }

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.orderService.getOrders().subscribe((data) => {
      this.orders = data;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter((order) => {
      return (
        (this.pendingChecked && order.status === 'Pending') ||
        (this.succeededChecked && order.status === 'Succeeded') ||
        (!this.pendingChecked && !this.succeededChecked)
      );
    });

    this.totalItems = this.filteredOrders.length;
    this.currentPage = 1;
    this.updateDisplayedOrders();
  }

  updatePageSize(pageSize: { id: string; value: string }): void {
    this.currentPage = 1;
    this.itemsPerPage = pageSize.value;
    this.pageSizesMenuOpen = false;
    this.updateDisplayedOrders();
  }

  updateDisplayedOrders(): void {
    const startIndex = (this.currentPage - 1) * +this.itemsPerPage;
    const endIndex = startIndex + +this.itemsPerPage;
    this.displayedOrders = this.filteredOrders.slice(startIndex, endIndex);
  }

  goToFirstPage(): void {
    this.currentPage = 1;
    this.updateDisplayedOrders();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedOrders();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedOrders();
    }
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
    this.updateDisplayedOrders();
  }

  togglePageSizesMenuOpen(open: boolean) {
    this.pageSizesMenuOpen = !this.pageSizesMenuOpen;
  }
}
