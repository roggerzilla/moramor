import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { CartItem } from '../../models/cart-item.model';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class CarritoComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Input() cartItems: CartItem[] = [];
  @Output() cartItemsChange = new EventEmitter<CartItem[]>();
  @Output() checkoutRequested = new EventEmitter<void>();
  @Input() cartItemCount = 0;

  toggleCart() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.closed.emit();
    }
  }

  closeCart() {
    this.isOpen = false;
    this.closed.emit();
  }

  increaseQuantity(item: CartItem) {
    item.quantity += 1;
    this.updateCart();
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity -= 1;
      this.updateCart();
    }
  }

  updateQuantity(item: CartItem) {
    if (item.quantity < 1) {
      item.quantity = 1;
    }
    this.updateCart();
  }

  removeItem(item: CartItem) {
    this.cartItems = this.cartItems.filter(i => i !== item);
    this.updateCart();
  }

  getTotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + (item.item.price * item.quantity), 
      0
    );
  }

  checkout() {
    this.checkoutRequested.emit();
    this.closeCart();
  }

  private updateCart() {
    this.cartItemsChange.emit(this.cartItems);
  }
}