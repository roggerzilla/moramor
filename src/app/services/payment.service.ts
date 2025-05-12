import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// Interfaces para tipado fuerte
interface User {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  /**
   * Carga el usuario actual desde el backend
   */
  private loadCurrentUser(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<User>(`${this.apiUrl}/user`, { headers }).pipe(
      tap(user => this.currentUser.next(user)),
      catchError(err => {
        if (err.status === 401) {
          localStorage.removeItem('token');
        }
        throw err;
      })
    ).subscribe();
  }

  /**
   * Crea una nueva orden con los datos completos que espera el backend
   */
  createOrder(orderData: {
    items: Array<any>,
    total: number,
    paymentIntentId: string,
    status: string,
    address_id: number
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ordersStore`, orderData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  /**
   * Crea un intent de pago para Stripe
   */
  createPaymentIntent(amount: number): Observable<{ clientSecret: string }> {
    return this.http.post<{ clientSecret: string }>(
      `${this.apiUrl}/create-payment-intent`, 
      { amount }
    );
  }

  /**
   * Resta el stock de los productos comprados
   */
  subtractStock(items: Array<{ item_id: number, quantity: number }>): Observable<any> {
    return this.http.post(`${this.apiUrl}/subtract-stock`, { items });
  }
}
