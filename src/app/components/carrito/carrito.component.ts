import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, style, transition, animate } from '@angular/animations';
import { CartItem } from '../../models/cart-item.model';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import Swal from 'sweetalert2';


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
  private _isOpen = false;

  @Input() set isOpen(value: boolean) {
    this._isOpen = value;
    this.isVisible = value;
    if (!value) this.startClosing = true;
  }
  get isOpen(): boolean {
    return this._isOpen;
  }

  @Output() closed = new EventEmitter<void>();
  @Input() cartItems: CartItem[] = [];
  @Output() cartItemsChange = new EventEmitter<CartItem[]>();
  @Output() checkoutRequested = new EventEmitter<void>();
  @Input() cartItemCount = 0;

  isVisible = false;
  startClosing = false;

  constructor(private router: Router, private cartService: CartService) {}

  closeCart() {
    this.isOpen = false;
    this.closed.emit();
  }

  onPanelAnimationDone(event: any) {
    if (this.startClosing && event.toState === 'void') {
      this.isVisible = false;
      this.startClosing = false;
    }
  }

  increaseQuantity(item: CartItem) {
    if (item.quantity < item.item.quantity) {
      item.quantity++;
      this.updateQuantity(item);
    }
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateQuantity(item);
    }
  }

updateQuantity(item: CartItem) {
  if (item.quantity < 1) {
    item.quantity = 1;
  }

  if (item.quantity > item.item.quantity) {
    item.quantity = item.item.quantity;

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: `Solo hay ${item.item.quantity} unidades de "${item.item.name}"`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#ffffff',
      color: '#28388E',
    });
  }

  this.cartService.updateCartItem(item.id, item.quantity).subscribe({
    next: () => {
      this.updateCart();
      this.cartService.getCartItems().subscribe(cartItems => {
        this.cartService.updateCartState(cartItems);
      });
    },
    error: (err) => console.error('Error al actualizar cantidad:', err)
  });
}


  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.id).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(i => i !== item);
        this.updateCart();
        this.cartService.getCartItems().subscribe(cartItems => {
          this.cartService.updateCartState(cartItems);
        });
      },
      error: (err) => console.error('Error al eliminar el ítem:', err)
    });
  }

  getTotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + item.item.price * item.quantity,
      0
    );
  }

  checkout() {
    this.checkoutRequested.emit();
    this.closeCart();
  }

  private updateCart() {
    this.cartItemsChange.emit([...this.cartItems]);
  }

  goToPayment(event: Event) {
    event.stopPropagation();
    this.closeCart();
    this.router.navigate(['/pay']);
  }
}
