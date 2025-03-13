import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderService } from '../../services/order.service';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-carrito',
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css',
})
export class CarritoComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(private cartService: CartService, private orderService: OrderService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.cartService.getCartItems().subscribe(
      (items: CartItem[]) => {
        this.cartItems = items;
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar los ítems del carrito:', error);
      }
    );
  }

// Incrementar la cantidad
increaseQuantity(item: CartItem): void {
  item.quantity += 1;
  this.updateQuantity(item);
}

// Disminuir la cantidad
decreaseQuantity(item: CartItem): void {
  if (item.quantity > 1) {
    item.quantity -= 1;
    this.updateQuantity(item);
  }
}

// Actualizar la cantidad en el backend
updateQuantity(item: CartItem): void {
  this.cartService.updateCartItem(item.id, item.quantity).subscribe(
    () => {
      console.log('Cantidad actualizada correctamente');
    },
    (error: HttpErrorResponse) => {
      console.error('Error al actualizar la cantidad:', error);
    }
  );
}

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id).subscribe(
      () => {
        alert('Ítem eliminado del carrito');
        this.loadCartItems(); // Recargar los ítems del carrito
      },
      (error: HttpErrorResponse) => {
        console.error('Error al eliminar el ítem:', error);
      }
    );
  }
  checkout(): void {
    console.log(localStorage.getItem("token"))
    this.userService.getUserInfo().subscribe(
      (user) => {
        const userId = user.id;
        const customerName = user.name; // Obtener el nombre del usuario
  
        const items = this.cartItems.map((cartItem) => ({
          id: cartItem.item.id,
          quantity: cartItem.quantity,
        }));
  
        this.orderService.createOrder(userId, customerName, items).subscribe(
          (response: any) => {
            alert('Compra realizada correctamente');
            this.cartService.clearCart().subscribe({
              next: () => console.log('Carrito vaciado correctamente'),
              error: (error) => console.error('Error al vaciar el carrito', error),
            }); // Vaciar el carrito después de la compra
            this.loadCartItems(); // Recargar los ítems del carrito
          },
          (error: HttpErrorResponse) => {
            console.error('Error al realizar la compra:', error);
            alert('Error al realizar la compra');
          }
        );
      },
      (error) => {
        console.error('Error al obtener usuario:', error);
        alert('Debes iniciar sesión para realizar la compra');
      }
    );
  }
}