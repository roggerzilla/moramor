import { Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterModule,],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent implements OnInit {
  private http = inject(HttpClient);
  items: any[] = [];
  token = localStorage.getItem('token');
  isLoading = true;  //carga

  constructor(private cartService: CartService,private router: Router,private notification:NotificationService) {}

  ngOnInit(): void {
    this.loadItems();
    this.isLoading = true; //carga
  }

  // Cargar productos desde la API
  loadItems(): void {
    this.http.get<any[]>('http://localhost:8000/api/items').subscribe(
      (items) => {
        this.items = items;
        this.isLoading = false; //carga
      },
      (error) => {
        console.error('Error al cargar los productos:', error);
        this.isLoading = false; //carga
      }
    );
  }

  // Agregar producto al carrito
  addToCart(item: any, quantity: any): void {
    const quantityNum = Number(quantity); // Convertimos a número

    if (!this.token) {
      this.notification.warning('Debes iniciar sesión para comprar.');
      return;
    }
  
    if (!this.token) {
      this.notification.warning('Debes iniciar sesión para comprar.');
      return;
    }
  
    if (isNaN(quantityNum) || quantityNum <= 0) {
      this.notification.warning('Ingresa una cantidad válida.');
      return;
    }
  
    if (quantityNum > item.quantity) {
      this.notification.error('No hay suficiente stock para la compra.');
      return;
    }
  
    this.cartService.addToCart(item.id, quantityNum).subscribe(
      () => {
        this.notification.success('Producto agregado al carrito');
      },
      (error) => {
        console.error('Error al agregar al carrito:', error);
        this.notification.error('Error al agregar el producto.');
      }
    );
  }

  notifyWhenInStock(event: Event, item: any): void {
    event.stopPropagation();

    if (!this.token) {
      this.notification.error('Debes iniciar sesión para recibir notificaciones.');
      return;
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  
    this.http.post('http://localhost:8000/api/stock-alerts', 
      { item_id: item.id },
      { 
        headers,
        withCredentials: true // Importante para Sanctum
      }
    ).subscribe({
      next: () => this.notification.success('Notificación registrada correctamente'),
      error: (err) => {
        console.error('Error detallado:', err);
        if (err.status === 401) {
          this.notification.error('Sesión expirada. Vuelve a iniciar sesión.');
        } else {
          this.notification.error('Error al registrar notificación');
        }
      }
    });
  }
  goToProductDetail(id: number) {
    this.router.navigate(['/producto-detalle', id]);
  }
}