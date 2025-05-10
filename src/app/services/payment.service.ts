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

interface CartItem {
  item: {
    id: number;
    price: number;
    name: string;
    [key: string]: any; // Propiedades adicionales
  };
  quantity: number;
}

interface OrderPayload {
  user_id: number;
  customer_name: string;
  items: Array<{
    id: number;
    quantity: number;
  }>;
  payment_intent_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8000/api';
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadCurrentUser(); // Carga el usuario al inicializar
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
   * Crea una nueva orden con validación de usuario
   */
  createOrder(orderData: { items: CartItem[], paymentIntentId: string }): Observable<any> {
    const user = this.currentUser.value;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const payload: OrderPayload = {
      user_id: user.id,
      customer_name: user.name || `${user.first_name} ${user.last_name}`.trim(),
      items: orderData.items.map(item => ({
        id: item.item.id,
        quantity: item.quantity
      })),
      payment_intent_id: orderData.paymentIntentId
    };

    return this.http.post(`${this.apiUrl}/ordersStore`, payload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  // ==================== Métodos adicionales ====================
  createPaymentIntent(amount: number): Observable<{ clientSecret: string }> {
    return this.http.post<{ clientSecret: string }>(
      `${this.apiUrl}/create-payment-intent`, 
      { amount }
    );
  }

  subtractStock(items: Array<{ item_id: number, quantity: number }>): Observable<any> {
    return this.http.post(`${this.apiUrl}/subtract-stock`, { items });
  }
}