import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Observable } from 'rxjs';

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
    image_url: '',
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
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar los items:', error);
        alert('No tienes permisos para ver esto o no has iniciado sesión.');
      }
    );
  }

  getUser(): void {
    const token = localStorage.getItem('token');
    console.log('Token:', token); // Verifica el token en la consola

    if (!token) {
      alert('No hay token de autenticación. Por favor, inicia sesión.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Headers:', headers); // Verifica las cabeceras en la consola

    this.http.get<any>('http://localhost:8000/api/user', { headers }).subscribe(
      (response) => {
        console.log('Usuario obtenido:', response);
        this.userRole = response.role;
      },
      (error: HttpErrorResponse) => {
        console.error('Error al obtener el usuario:', error);
        if (error.status === 401) {
          alert('No autorizado. Por favor, inicia sesión nuevamente.');
          localStorage.removeItem('token'); // Elimina el token inválido
          // this.router.navigate(['/login']); // Redirige al login
        } else {
          alert('Error al obtener el usuario. Por favor, inténtalo de nuevo.');
        }
      }
    );
  }

  // Agregar un item al inventario
  addItem(): void {
    if (!this.item.image_url) {
      alert('Por favor, sube una imagen antes de agregar el item.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    console.log('items', this.item);
    this.http.post('http://localhost:8000/api/items', this.item, { headers }).subscribe(
      (response) => {
        console.log('Item agregado correctamente:', response);
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
    if (!file) {
      alert('Por favor, selecciona una imagen.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.post<{ path: string }>('http://localhost:8000/api/upload-image', formData, { headers }).subscribe(
      (response) => {
        if (response.path) {
          // Construye la URL completa de la imagen
          const baseUrl = 'http://localhost:8000/storage/';
          const imageUrl = baseUrl + response.path.replace('public/', ''); // Elimina 'public/' de la ruta
          this.item.image_url = imageUrl;
          console.log('Imagen subida correctamente:', imageUrl);
        } else {
          console.error('La respuesta del backend no contiene la ruta de la imagen.');
          alert('Error: La respuesta del backend no contiene la ruta de la imagen.');
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error subiendo la imagen:', error);
        alert('Error al subir la imagen. Por favor, inténtalo de nuevo.');
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
      image_url: '',
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
      (response) => {
        console.log('Item actualizado correctamente:', response);
        item.editing = false;
        this.loadItems();
      },
      (error: HttpErrorResponse) => {
        console.error('Error al actualizar el item:', error);
        alert('Error al actualizar el item. Por favor, inténtalo de nuevo.');
      }
    );
  }

  // Agregar un item al carrito
 // En tu componente
// En tu componente
addToCart(item: any): void {
  this.cartService.addToCart(item.id, 1).subscribe(
    () => {
      alert('Ítem agregado al carrito');
      this.cartService.getCartItems(); // Recargar los ítems del carrito
    },
    (error: HttpErrorResponse) => {
      console.error('Error al agregar el ítem al carrito:', error);
      alert('No se pudo agregar el ítem al carrito');
    }
  );
}
}