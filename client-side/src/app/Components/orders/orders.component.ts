import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../Services/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from '../shared/dropdown/dropdown.component';

interface Order {
  orderNumber: string;
  status: string;
  total: string;
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

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.orderService
      .getOrders(this.currentPage, +this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.orders = response.data.orders;
          this.totalItems = response.data.totalOrders;
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error fetching orders:', err);
        },
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

    this.currentPage = 1;
    this.updateDisplayedOrders();
  }

  updateDisplayedOrders(): void {
    const startIndex = (this.currentPage - 1) * +this.itemsPerPage;
    const endIndex = startIndex + +this.itemsPerPage;
    this.displayedOrders = this.filteredOrders.slice(startIndex, endIndex);
  }

  updatePageSize(pageSize: { id: string; value: string }): void {
    this.itemsPerPage = pageSize.value;
    this.currentPage = 1;
    this.pageSizesMenuOpen = false;
    this.fetchOrders();
  }

  goToFirstPage(): void {
    this.currentPage = 1;
    this.fetchOrders();
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchOrders();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchOrders();
    }
  }

  goToLastPage(): void {
    this.currentPage = this.totalPages;
    this.fetchOrders();
  }

  togglePageSizesMenuOpen(open: boolean) {
    this.pageSizesMenuOpen = open;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / +this.itemsPerPage));
  }
}
