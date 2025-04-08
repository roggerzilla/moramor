import { Component, OnInit } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentService } from '../../services/payment.service';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  imports: [
    CommonModule,  // Asegúrate de que CommonModule esté importado
  ],
})
export class PaymentComponent implements OnInit {
  stripe: any;
  paymentElement: any;
  elements: any;
  isLoading = true;
  error: string | null = null;
  cartItems: CartItem[] = [];
  totalAmount: number = 0; // Total a pagar

  constructor(
    private paymentService: PaymentService,
    private cartService: CartService
  ) {}

  async ngOnInit() {
    // 1. Cargar Stripe con tu clave pública
    this.stripe = await loadStripe('pk_test_51RBMauP5YAunVj6pbcfSdzr2XUkhkd6ryGfqqL0rdOCv3d2YtVZRIvwaMcQVL1uZcmoswy2sXD3OwEfN0eCW2K9v00N7oPp1qB');

    // 2. Obtener los ítems del carrito
    this.cartService.getCartItems().subscribe({
      next: (items: CartItem[]) => {
        this.cartItems = items;
        this.calculateTotalAmount();
        this.createPaymentIntent();
      },
      error: (err: any) => {
        this.error = 'Error al obtener los ítems del carrito';
        this.isLoading = false;
      }
    });
  }

  // Función para calcular el total del carrito
  calculateTotalAmount() {
    this.totalAmount = this.cartItems.reduce((sum, item) => {
      return sum + (item.item.price * item.quantity); // Precio * cantidad de cada ítem
    }, 0);

    // Convertimos a centavos (Stripe usa centavos)
    this.totalAmount = this.totalAmount * 100; // Ejemplo: $10.00 USD = 1000 centavos
  }

  // Función para crear el PaymentIntent en el backend
  createPaymentIntent() {
    this.paymentService.createPaymentIntent(this.totalAmount).subscribe({
      next: (response: { clientSecret: string }) => {
        this.setupStripeElements(response.clientSecret);
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Error al conectar con el servidor';
        this.isLoading = false;
      }
    });
  }

  private setupStripeElements(clientSecret: string) {
    const appearance = {
      theme: 'flat',
      variables: {
        colorPrimary: '#635bff',
        colorText: '#333',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': {
          border: '1px solid #ddd',
          borderRadius: '6px',
          padding: '12px',
        }
      }
    };

    this.elements = this.stripe.elements({ clientSecret, appearance });

    this.paymentElement = this.elements.create('payment', {
      layout: {
        type: 'tabs',
        defaultCollapsed: false,
      }
    });

    this.paymentElement.mount('#payment-element');
  }

  async handlePayment() {
    this.isLoading = true;

    const { error, paymentIntent } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.origin + '/orden-completada',
      },
    });

    this.isLoading = false;

    if (error) {
      this.error = error.message;
      return;
    }

    if (paymentIntent) {
      this.paymentService.confirmPayment(paymentIntent.id).subscribe();
    }
  }
}
