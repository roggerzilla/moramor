import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-inventory',
  imports: [FormsModule, HttpClientModule, CommonModule, RouterModule],
  standalone: true,
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent implements OnInit {
  private http = inject(HttpClient);
  items: any[] = [];
  userRole: string | null = null;
  token = localStorage.getItem('token');

  item = {
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    image_urls: [] as string[],
  };

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadItems();
    this.getUser();
  }

  // Cargar los items del inventario
  loadItems(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.get<any[]>('http://localhost:8000/api/items', { headers }).subscribe(
      (items) => {
        this.items = items.map((item) => ({ ...item, editing: false }));
        console.log(this.items)
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar los items:', error);
        alert('No tienes permisos para ver esto o no has iniciado sesión.');
      }
    );
    
  }

  getUser(): void {
    if (!this.token) {
      alert('No hay token de autenticación. Por favor, inicia sesión.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.get<any>('http://localhost:8000/api/user', { headers }).subscribe(
      (response) => {
        this.userRole = response.role;
      },
      (error: HttpErrorResponse) => {
        console.error('Error al obtener el usuario:', error);
        if (error.status === 401) {
          alert('No autorizado. Por favor, inicia sesión nuevamente.');
          localStorage.removeItem('token');
        } else {
          alert('Error al obtener el usuario. Por favor, inténtalo de nuevo.');
        }
      }
    );
  }

  // Agregar un item al inventario
  addItem(): void {
    if (this.item.image_urls.length === 0) {
      alert('Por favor, sube al menos una imagen antes de agregar el item.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.post('http://localhost:8000/api/items', this.item, { headers }).subscribe(
      () => {
        alert('¡Item agregado!');
        this.loadItems();
        this.resetForm();
      },
      (error: HttpErrorResponse) => {
        console.error('Error al agregar el item:', error);
        alert('Error al agregar el item. Por favor, inténtalo de nuevo.');
      }
    );
  }

  // Subir una imagen
  uploadImage(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.post<{ path: string }>('http://localhost:8000/api/upload-image', formData, { headers }).subscribe(
      (response) => {
        const baseUrl = 'http://localhost:8000/storage/';
        const imageUrl = baseUrl + response.path.replace('public/', '');
        if (this.item.image_urls.length < 4) {
          this.item.image_urls.push(imageUrl);
        } else {
          alert('Solo puedes subir hasta 4 imágenes por producto.');
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error al subir la imagen:', error);
        alert('Error al subir la imagen.');
      }
    );
  }

  // Reiniciar el formulario
  resetForm(): void {
    this.item = {
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      image_urls: [],
    };
  }

  // Alternar la edición de un item
  toggleEdit(item: any): void {
    item.editing = !item.editing;
  }

  // Actualizar un item
  updateItem(item: any): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.put(`http://localhost:8000/api/items/${item.id}`, item, { headers }).subscribe(
      () => {
        item.editing = false;
        this.loadItems();
      },
      (error: HttpErrorResponse) => {
        console.error('Error al actualizar el item:', error);
        alert('Error al actualizar el item. Por favor, inténtalo de nuevo.');
      }
    );
  }

  // Agregar al carrito
  addToCart(item: any): void {
    this.cartService.addToCart(item.id, 1).subscribe(
      () => {
        alert('Ítem agregado al carrito');
        this.cartService.getCartItems();
      },
      (error: HttpErrorResponse) => {
        console.error('Error al agregar el ítem al carrito:', error);
        alert('No se pudo agregar el ítem al carrito');
      }
    );
  }
}
