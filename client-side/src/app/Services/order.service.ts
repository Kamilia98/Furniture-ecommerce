import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Order {
  orderNumber: string;
  status: string;
  total: string;
  createdAt: string;
}

interface OrdersResponse {
  status: string;
  data: {
    orders: Order[];
    totalOrders: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://localhost:5000/orders';

  constructor(private http: HttpClient) {}
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
  getOrders(page: number = 1, limit: number = 10): Observable<OrdersResponse> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<OrdersResponse>(this.apiUrl, { headers, params });
  }
}
