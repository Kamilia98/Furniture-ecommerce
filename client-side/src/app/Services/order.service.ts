import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

interface Order {
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orders: Order[] = [];

  constructor() {
    // Generate 50 orders for multiple pages
    for (let i = 1; i <= 50; i++) {
      this.orders.push({
        orderNumber: `10${i}`,
        status: i % 2 === 0 ? 'Pending' : 'Succeeded',
        total: Math.random() * 500,
        createdAt: `2024-03-${(i % 31) + 1}`,
      });
    }
  }

  getOrders(): Observable<Order[]> {
    return of(this.orders);
  }
}
