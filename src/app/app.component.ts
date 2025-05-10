import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule, HttpClientModule, CarritoComponent],
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
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;
  
  showCountrySelection: boolean = true;
  showAgeVerificationModal: boolean = false;
  userRole: string | null = null;
  isLoggedIn: boolean = false;
  selectedCountry: string | null = null;
  
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
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.checkLoginStatus();
    this.getUser();
  
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
      this.selectedCountry = savedCountry;
      this.showCountrySelection = false;
  
      if (savedCountry === 'MX') {
        this.checkAgeVerification(); // aún necesitas verificar edad
      } else if (savedCountry === 'US') {
        window.location.href = 'https://google.com'; // o la URL correcta
      }
    }
  }

  ngAfterViewInit() {
    // Intenta reproducir el video (necesario para algunos navegadores móviles)
    if (this.backgroundVideo) {
      this.backgroundVideo.nativeElement.play().catch(error => {
        console.log('Autoplay prevented:', error);
      });
    }
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
      this.getUser();
    }
  }

  selectCountry(country: string) {
    this.selectedCountry = country;
    localStorage.setItem('selectedCountry', country); // 👈 Guardar en localStorage
    this.showCountrySelection = false;
  
    if (country === 'MX') {
      this.checkAgeVerification();
    } else if (country === 'US') {
      window.location.href = 'https://google.com';
    }
  }

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
      // Después de confirmar edad, obtenemos la ubicación
      this.getLocation();
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
      this.router.navigate(['/home']);
    });
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
    console.log(this.isCartOpen);
  
    if (this.isCartOpen && this.cartItems.length === 0) {
      this.loadCartItems();
    }
  }

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

  onCartItemsChange(items: CartItem[]) {
    this.cartItems = items;
    this.cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  }

  onCheckout() {
    console.log('Compra realizada', this.cartItems);
    this.isCartOpen = false;
    // Aquí puedes añadir lógica adicional para el checkout
  }
}