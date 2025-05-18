// ... imports
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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
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
addressMode: 'new' | 'saved' = 'saved';
flag:boolean=true;

  newAddress = {
    street: '',
    address2: '',
    colonia: '',
    city: '',
    state: '',
    postal_code: '', // ✅ nombre correcto
    country: 'México' // ✅ país fijo
  };
  
  
  stripeInitialized = false;


  constructor(
    private paymentService: PaymentService,
    private cartService: CartService,
    private router: Router,
    private userService: UserService
  ) {}

  async ngOnInit() {
    this.stripe = await loadStripe('pk_test_51RBMauP5YAunVj6pbcfSdzr2XUkhkd6ryGfqqL0rdOCv3d2YtVZRIvwaMcQVL1uZcmoswy2sXD3OwEfN0eCW2K9v00N7oPp1qB');

  this.cartService.getCartItems().subscribe();

  // Luego suscríbete solo a cartItems$
  this.cartService.cartItems$.subscribe(items => {
    this.cartItems = items;
            this.calculateTotalAmount();
         if (!this.stripeInitialized && this.cartItems.length > 0) {
    this.initializeStripeElements();
    this.stripeInitialized = true;
  }
        this.isLoading = false;
      
  });


    this.userService.getUserAddresses().subscribe(addresses => {
      this.userAddresses = addresses;
      if (addresses.length > 0) {
        this.selectedAddressId = addresses[0].id;
      }
    });
    this.loadAddresses();

  }

  calculateTotalAmount() {
    this.totalAmount = this.cartItems.reduce((sum, item) => {
      return sum + (item.item.price * item.quantity);
    }, 0) * 100;
  }

  private async initializeStripeElements() {
    try {
      const response = await firstValueFrom(this.paymentService.createPaymentIntent(this.totalAmount));

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
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'Ideal Sans, system-ui, sans-serif',
        spacingUnit: '5px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          border: '1px solid #ddd',
          borderRadius: '6px',
          padding: '12px',
          width: '20px',
        },
        '.Input--cardNumber': {
          fontSize: '12px',
          padding: '8px',
        },
        '.Input--expirationDate': {
          fontSize: '12px',
          padding: '8px',
        },
        '.Input--cvc': {
          fontSize: '12px',
          padding: '8px',
        },
        '.Input--billingCountry': {
          fontSize: '12px',
          padding: '8px',
        },
      },
    };
  }

  async handlePayment() {
    if (!this.stripe || !this.elements) {
      this.error = 'Stripe no está inicializado correctamente';
      return;
    }

  this.isLoading = true;
  this.error = null;
  this.saveNewAddress();

  // ✅ Paso 1: Verificar stock antes de intentar cobrar
  try {
    const itemsToVerify = this.cartItems.map(item => ({
      item_id: item.item.id,
      quantity: item.quantity
    }));

    const stockResponse = await firstValueFrom(this.paymentService.verifyStock(itemsToVerify));

    if (!stockResponse.success) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: stockResponse.message || 'No hay suficiente stock',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#ffffff',
        color: '#28388E',
      });
      this.isLoading = false;
      return;
    }
  } catch (err: any) {
    const errorMessage = err?.error?.message || 'Error al verificar el stock.';
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: errorMessage,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#ffffff',
      color: '#28388E',
    });
    this.isLoading = false;
    console.error(err);
    return;
  }

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

  async handlePayment2() {
    if (!this.stripe || !this.elements) {
      this.error = 'Stripe no está inicializado correctamente';
      return;
    }

  this.isLoading = true;
  this.error = null;

  // ✅ Paso 1: Verificar stock antes de intentar cobrar
  try {
    const itemsToVerify = this.cartItems.map(item => ({
      item_id: item.item.id,
      quantity: item.quantity
    }));

    const stockResponse = await firstValueFrom(this.paymentService.verifyStock(itemsToVerify));

    if (!stockResponse.success) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: stockResponse.message || 'No hay suficiente stock',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#ffffff',
        color: '#28388E',
      });
      this.isLoading = false;
      return;
    }
  } catch (err: any) {
    const errorMessage = err?.error?.message || 'Error al verificar el stock.';
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'warning',
      title: errorMessage,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#ffffff',
      color: '#28388E',
    });
    this.isLoading = false;
    console.error(err);
    return;
  }

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
    error: (err) => {
      this.error = 'No hay suficiente stock en uno de los productos.';
      console.error(err);
      return; // ❗️ DETENER la ejecución
    }
  });
}


  private handleError(message: string, error: any) {
    this.error = message;
    this.isLoading = false;
    console.error(error);
  }

  async saveNewAddress() {
    const { street, address2,colonia, city, state, postal_code, country } = this.newAddress;

    if (!street || !city ||!colonia|| !state || !postal_code) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }

    try {
      const user = await firstValueFrom(this.userService.getCurrentUser());

      const newAddressPayload = {
        street,
        address2,
        colonia,
        city,
        state,
        postal_code,
        country, // ✅ Incluimos el país fijo
        user_id: user.id
      };

      const saved = await firstValueFrom(this.userService.saveAddress(newAddressPayload));

      this.userAddresses.push(saved);
      this.selectedAddressId = saved.id;
      this.addressMode = 'saved';
          this.userService.getUserAddresses().subscribe(addresses => {
      this.userAddresses = addresses;
      if (addresses.length > 0) {
        this.selectedAddressId = addresses[0].id;
      }
    });
    } catch (error) {
      this.error = 'Error al guardar la dirección.';
      console.error(error);
    }
  }
  selectedAddress: any = null;



// Método para cargar direcciones (llamarlo en ngOnInit y al cambiar a modo 'saved')
loadAddresses() {
  this.userService.getUserAddresses().subscribe({
    next: (addresses) => {
      this.userAddresses = addresses;
      if (addresses.length > 0) {
        this.selectedAddressId = addresses[0].id;
        this.selectedAddress = addresses[0]; // Asigna la primera dirección
      }
    },
    error: (err) => {
      console.error('Error al cargar direcciones:', err);
    }
  });
}

// Método para manejar selección de dirección
onAddressSelect() {
  if (this.selectedAddressId) {
    this.selectedAddress = this.userAddresses.find(addr => addr.id == this.selectedAddressId);
  } else {
    this.selectedAddress = null;
  }
}

  useSavedAddress() {
    this.addressMode = 'saved';
    this.flag=true;
  }

  // Al agregar nueva dirección (envía true al backend)
  addNewAddress() {
    this.addressMode = 'new';
    this.flag=false;
  }

  // Función para enviar la bandera al backend (Laravel)


}
