import { Component, inject, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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

  constructor(private cartService: CartService,private router: Router) {}

  ngOnInit(): void {
    this.loadItems();
  }

  // Cargar productos desde la API
  loadItems(): void {
    this.http.get<any[]>('http://localhost:8000/api/items').subscribe(
      (items) => {
        this.items = items;
      },
      (error) => {
        console.error('Error al cargar los productos:', error);
      }
    );
  }

  // Agregar producto al carrito
  addToCart(item: any, quantity: any): void {
    const quantityNum = Number(quantity); // Convertimos a número

    if (!this.token) {
      alert('Debes iniciar sesión para comprar.');
      return;
    }
  
    if (!this.token) {
      alert('Debes iniciar sesión para comprar.');
      return;
    }
  
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Ingresa una cantidad válida.');
      return;
    }
  
    if (quantityNum > item.quantity) {
      alert('No hay suficiente stock para la compra.');
      return;
    }
  
    this.cartService.addToCart(item.id, quantityNum).subscribe(
      () => {
        alert('Producto agregado al carrito');
      },
      (error) => {
        console.error('Error al agregar al carrito:', error);
        alert('Error al agregar el producto.');
      }
    );
  }

  notifyWhenInStock(event: Event, item: any): void {
    event.stopPropagation();
    console.log('Botón de notificación clickeado'); 
    if (!this.token) {
      alert('Debes iniciar sesión para recibir notificaciones.');
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
      next: () => alert('Notificación registrada correctamente'),
      error: (err) => {
        console.error('Error detallado:', err);
        if (err.status === 401) {
          alert('Sesión expirada. Vuelve a iniciar sesión.');
        } else {
          alert('Error al registrar notificación');
        }
      }
    });
  }
  goToProductDetail(id: number) {
    this.router.navigate(['/producto-detalle', id]);
  }
}