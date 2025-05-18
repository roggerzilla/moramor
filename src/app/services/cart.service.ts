import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { CartItem } from '../models/cart-item.model';
import { environment } from '../../environments/environment'; // Añadido

@Injectable({
  providedIn: 'root',
})
export class CartService {
private apiUrl = `${environment.apiUrl}/cart`;


  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
cartItems$ = this.cartItemsSubject.asObservable();

getCartItems(): Observable<CartItem[]> {
  return this.http.get<CartItem[]>(this.apiUrl).pipe(
    tap(items => {
      this.cartItemsSubject.next(items); // Solo este BehaviorSubject, no dos.
    }),
    catchError(() => {
      this.cartItemsSubject.next([]); // En error, limpiar carrito.
      return of([]);
    })
  );
}


addToCart(itemId: number, quantity: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/add`, { item_id: itemId, quantity }).pipe(
    switchMap(() => this.getCartItems()) // Actualiza y emite el nuevo estado
  );
}

updateCartItem(cartItemId: number, quantity: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/update/${cartItemId}`, { quantity }).pipe(
    switchMap(() => this.getCartItems())
  );
}

removeFromCart(cartItemId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/remove/${cartItemId}`).pipe(
    switchMap(() => this.getCartItems())
  );
}

  clearCart(): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.post(`${this.apiUrl}/clear`, {}, { headers }).pipe(
      switchMap(() => this.getCartItems()),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al limpiar el carrito:', error);
        return of(null);
      })
    );
  }

  updateCartState(cartItems: CartItem[]): void {
    this.cartItemsSubject.next(cartItems);
  }

  private cartState = new BehaviorSubject<CartItem[]>([]);
cartState$ = this.cartState.asObservable();

}
