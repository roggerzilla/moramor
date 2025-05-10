import { Component, OnInit } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { PaymentService } from '../../services/payment.service';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PaymentComponent implements OnInit {
  stripe: Stripe | null = null;
  paymentElement: StripePaymentElement | null = null;
  elements: StripeElements | null = null;
  isLoading = true;
  error: string | null = null;
  cartItems: CartItem[] = [];
  totalAmount: number = 0;

  constructor(
    private paymentService: PaymentService,
    private cartService: CartService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.stripe = await loadStripe('pk_test_51RBMauP5YAunVj6pbcfSdzr2XUkhkd6ryGfqqL0rdOCv3d2YtVZRIvwaMcQVL1uZcmoswy2sXD3OwEfN0eCW2K9v00N7oPp1qB');

    this.cartService.getCartItems().subscribe({
      next: async (items: CartItem[]) => {
        this.cartItems = items;
        this.calculateTotalAmount();
        await this.initializeStripeElements();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Error al obtener los ítems del carrito';
        this.isLoading = false;
      }
    });
  }

  calculateTotalAmount() {
    this.totalAmount = this.cartItems.reduce((sum, item) => {
      return sum + (item.item.price * item.quantity);
    }, 0) * 100;
  }

  private async initializeStripeElements() {
    try {
      const response = await firstValueFrom(
        this.paymentService.createPaymentIntent(this.totalAmount)
      );
      
      if (!response?.clientSecret) {
        throw new Error('No se recibió clientSecret del servidor');
      }

      this.elements = this.stripe!.elements({
        clientSecret: response.clientSecret,
        appearance: this.getStripeAppearance()
      });

      this.paymentElement = this.elements.create('payment', {
        layout: {
          type: 'tabs',
          defaultCollapsed: false,
        }
      });

      this.paymentElement.mount('#payment-element');
    } catch (err) {
      this.handleError('Error al inicializar Stripe', err);
    }
  }

  private getStripeAppearance() {
    return {
      theme: 'flat' as const,
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
  }

  async handlePayment() {
    if (!this.stripe || !this.elements) {
      this.error = 'Stripe no está inicializado correctamente';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          receipt_email: 'user@example.com',
        },
        redirect: 'if_required'
      });

      if (error) {
        this.handleStripeError(error);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        this.processPayment(paymentIntent.id);
      }
    } catch (err) {
      this.handleError('Error inesperado al procesar el pago', err);
    } finally {
      this.isLoading = false;
    }
  }

  private handleStripeError(error: any) {
    if (error.code === 'payment_intent_unexpected_state' && 
        error.paymentIntent?.status === 'succeeded') {
      this.processPayment(error.paymentIntent.id);
      return;
    }
    this.error = error.message || 'Error al procesar el pago';
  }

  processPayment(paymentIntentId: string) {
    const orderData = {
      items: this.cartItems,
      totalAmount: this.totalAmount / 100,
      paymentIntentId: paymentIntentId,
      status: 'completed'
    };
  
    this.paymentService.createOrder(orderData).subscribe({
      next: () => {
        this.cartService.clearCart().subscribe();
        this.router.navigate(['/home'], {
          state: { paymentIntentId }
        });
      },
      error: (err) => {
        this.error = 'Error al crear el pedido';
        console.error(err);
      }
    });
  }

  private handleError(message: string, error: any) {
    this.error = message;
    this.isLoading = false;
    console.error(error);
  }
}