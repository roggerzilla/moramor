import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://localhost:8000/api/orders'; // Ajusta la URL según tu backend
  private apiUrl2 = 'http://localhost:8000/api/ordersStore';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<Order[]>(this.apiUrl, { headers });
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }
  createOrder(userId: number, customerName: string, items: any[]): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    const body = {
      user_id: userId,
      customer_name: customerName, // Enviar el nombre del cliente
      items: items,
    };
    console.log('Datos enviados a la API:', JSON.stringify(body, null, 2)); 
    return this.http.post(this.apiUrl2, body, { headers });
  }
  updateOrderStatus(orderId: number, estatus: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/status`, { estatus });
  }
}