import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8000/api' ;
 

 
  constructor(private http: HttpClient) { }

  // Obtiene el clientSecret desde Laravel
  createPaymentIntent(amount: number, currency: string = 'mxn') {
    return this.http.post<{ clientSecret: string }>(
      `${this.apiUrl}/create-payment-intent`,
      { amount, currency }
    );
  }

  // Opcional: Verifica el estado del pago
  confirmPayment(paymentIntentId: string) {
    return this.http.post<{ status: string }>(
      `${this.apiUrl}/confirm-payment`,
      { payment_intent_id: paymentIntentId }
    );
  }
  subtractStock(items: any[]): Observable<any> {
    return this.http.post('/api/subtract-stock', { items });
  }
}