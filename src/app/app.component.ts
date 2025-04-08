import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeolocationService } from './services/geolocation.service';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CartService } from './services/cart.service';
import { CartItem } from './models/cart-item.model';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { OrderService } from './services/order.service';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { CarritoComponent } from './components/carrito/carrito.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule, HttpClientModule,CarritoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)'
      })),
      state('out', style({
        transform: 'translateX(100%)'
      })),
      transition('in <=> out', animate('300ms ease-in-out'))
    ]),
    trigger('fadeInOut', [
      state('in', style({
        opacity: 1
      })),
      state('out', style({
        opacity: 0
      })),
      transition('in <=> out', animate('300ms ease-in-out'))
    ])
  ]
})
export class AppComponent implements OnInit {
  showAgeVerificationModal: boolean = false;
  userRole: string | null = null;
  isLoggedIn: boolean = false;
  
  // Variables para el carrito
  isCartOpen = false;
  cartItems: CartItem[] = [];
  cartItemCount = 0;

  constructor(
    private geolocationService: GeolocationService,
    private http: HttpClient,
    private cartService: CartService,
    private router: Router,
    private userService: UserService,
    private orderService: OrderService,
    private authService:AuthService
  ) {}

  ngOnInit(): void {
    this.checkAgeVerification();
    this.getLocation();
    this.getUser();
    this.checkLoginStatus();

  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
      this.getUser();
      
    }
  }

  // Métodos existentes (verificación de edad, geolocalización y usuario)
  checkAgeVerification(): void {
    const hasConfirmedAge = localStorage.getItem('hasConfirmedAge');
    if (hasConfirmedAge !== 'true') {
      this.showAgeVerificationModal = true;
    }
  }

  confirmAge(isOfAge: boolean): void {
    if (isOfAge) {
      localStorage.setItem('hasConfirmedAge', 'true');
      this.showAgeVerificationModal = false;
    } else {
      window.location.href = 'https://www.google.com';
    }
  }

  getLocation() {
    this.geolocationService.getCurrentPosition()
      .then(position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        this.http.post('/api/location', { latitude, longitude })
          .subscribe(response => {
            console.log('Location sent to backend:', response);
          }, error => {
            console.error('Error sending location to backend:', error);
          });
      })
      .catch(error => {
        console.error('Error getting location:', error);
      });
  }

  getUser(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any>('http://localhost:8000/api/user', { headers }).subscribe(
      (response) => {
        this.userRole = response.role;
      },
      (error) => {
        if (error.status === 401) {
          localStorage.removeItem('token');
          this.isLoggedIn = false;
        }
      }
    );
  }
  logout(): void {
    this.authService.logout().subscribe(() => {
      localStorage.removeItem('token');
      this.isLoggedIn = false;
      this.router.navigate(['/home']);  // Redirigir al usuario al home después de cerrar sesión
    });
  }


  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
    console.log(this.isCartOpen);
  
    // Solo carga si no hay items todavía
    if (this.isCartOpen && this.cartItems.length === 0) {
      this.loadCartItems();
    }
  }

  // Método para cargar los items del carrito
  loadCartItems() {
    this.cartService.getCartItems().subscribe({
      next: (items: CartItem[]) => {
        this.cartItems = items;
        this.cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      },
      error: (error) => {
        console.error('Error al cargar el carrito:', error);
      }
    });
  }

  // Método cuando cambian los items del carrito
  onCartItemsChange(items: CartItem[]) {
    this.cartItems = items;
    this.cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Método para finalizar compra
  onCheckout() {
    console.log('Compra realizada', this.cartItems);
    this.isCartOpen = false;
    // Aquí puedes añadir lógica adicional para el checkout
  }


  // Métodos para el carrito
 
}