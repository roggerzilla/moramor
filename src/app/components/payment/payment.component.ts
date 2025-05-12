import { Component, OnInit } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { PaymentService } from '../../services/payment.service';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  imports: [CommonModule,FormsModule]
})
export class PaymentComponent implements OnInit {
  stripe: Stripe | null = null;
  paymentElement: StripePaymentElement | null = null;
  elements: StripeElements | null = null;
  isLoading = true;
  error: string | null = null;
  cartItems: CartItem[] = [];
  totalAmount: number = 0;

  userAddresses: any[] = [];
  selectedAddressId: number | null = null;

  constructor(
    private paymentService: PaymentService,
    private cartService: CartService,
    private router: Router,
    private userService: UserService,
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
    this.userService.getUserAddresses().subscribe(addresses => {
      this.userAddresses = addresses;
      if (addresses.length > 0) {
        this.selectedAddressId = addresses[0].id;  // Solo almacenamos el 'id', no el objeto completo
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
    const itemsToUpdate = this.cartItems.map(item => ({
      item_id: item.item.id,
      quantity: item.quantity
    }));
  
    this.paymentService.subtractStock(itemsToUpdate).subscribe({
      next: () => {
        // Obtener el usuario autenticado
        this.userService.getCurrentUser().subscribe({
          next: (user) => {
            const orderData = {
              user_id: user.id,
              customer_name: user.name,
              items: this.cartItems.map(item => ({
                id: item.item.id,
                quantity: item.quantity
              })),
              total: this.totalAmount / 100,
              paymentIntentId: paymentIntentId,
              status: 'completed',
              address_id: Number(this.selectedAddressId)
            };
  
            console.log('Order data being sent:', orderData);
  
            this.paymentService.createOrder(orderData).subscribe({
              next: () => {
                this.cartService.clearCart().subscribe();
                this.router.navigate(['/order-confirmation'], {
                  state: { paymentIntentId }
                });
              },
              error: (err) => {
                this.error = 'Error al crear el pedido';
                console.error(err);
              }
            });
          },
          error: (err) => {
            this.error = 'Error al obtener el usuario';
            console.error(err);
          }
        });
      },
      error: (err: any) => {
        this.error = 'Error al actualizar el stock';
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