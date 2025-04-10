import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:8000/api/cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Obtener el token del localStorage
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtener los ítems del carrito del usuario
  getCartItems(): Observable<CartItem[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http.get<CartItem[]>('http://localhost:8000/api/cart', { headers });
  }
  // Agregar un ítem al carrito
  addToCart(itemId: number, quantity: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http
      .post('http://localhost:8000/api/cart/add', { item_id: itemId, quantity }, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al agregar el ítem al carrito:', error);
          return of(null); // Devuelve un Observable que no emite ningún valor
        })
      );
  }

  // Actualizar la cantidad de un ítem en el carrito
  updateCartItem(cartItemId: number, quantity: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http
      .put(`http://localhost:8000/api/cart/update/${cartItemId}`, { quantity }, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al actualizar el ítem del carrito:', error);
          return of(null); // Devuelve un Observable que no emite ningún valor
        })
      );
  }

  // Eliminar un ítem del carrito
  removeFromCart(cartItemId: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    return this.http
      .delete(`http://localhost:8000/api/cart/remove/${cartItemId}`, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error al eliminar el ítem del carrito:', error);
          return of(null); // Devuelve un Observable que no emite ningún valor
        })
      );
  }

  clearCart(): Observable<any> {
    return this.http.post(`${this.apiUrl}/clear`, {}); // Llamada al backend
  }
  
}