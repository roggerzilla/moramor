import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:8000/api/cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCartItems(): Observable<CartItem[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<CartItem[]>(`${this.apiUrl}`, { headers }).pipe(
      tap(items => this.cartItemsSubject.next(items)), // actualiza localmente
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener los ítems del carrito:', error);
        this.cartItemsSubject.next([]); // también limpia local si hay error
        return of([]);
      })
    );
  }

  addToCart(itemId: number, quantity: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http
      .post(`${this.apiUrl}/add`, { item_id: itemId, quantity }, { headers })
      .pipe(
        switchMap(() => this.getCartItems()), // recarga automáticamente después de agregar
        catchError((error: HttpErrorResponse) => {
          console.error('Error al agregar el ítem al carrito:', error);
          return of(null);
        })
      );
  }

  updateCartItem(cartItemId: number, quantity: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http
      .put(`${this.apiUrl}/update/${cartItemId}`, { quantity }, { headers })
      .pipe(
        switchMap(() => this.getCartItems()),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar el ítem del carrito:', error);
          return of(null);
        })
      );
  }

  removeFromCart(cartItemId: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http
      .delete(`${this.apiUrl}/remove/${cartItemId}`, { headers })
      .pipe(
        switchMap(() => this.getCartItems()),
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar el ítem del carrito:', error);
          return of(null);
        })
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
}
