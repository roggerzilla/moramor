import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, RouterModule, NgxPaginationModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
})
export class InventoryComponent implements OnInit {
  private http = inject(HttpClient);
  activeItems: any[] = [];
  deletedItems: any[] = [];
  userRole: string | null = null;
  token = localStorage.getItem('token');
  pageSize = 9;
  currentPage = 1;
  deletedPage = 1;
pageSizeDeleted = 9;
  currentPageDeleted = 1;


  item = {
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    image_urls: [] as string[],
  };

  constructor(private cartService: CartService, private notification: NotificationService) {}

  ngOnInit(): void {
    this.loadItems();
      this.loadDeletedItems();
    this.getUser();
  }

  loadItems(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.get<any[]>('http://localhost:8000/api/items', { headers }).subscribe(
      (items) => {
        this.activeItems = items.filter(item => !item.deleted).map(item => ({ ...item, editing: false }));
      },
      (error: HttpErrorResponse) => {
        console.error('Error al cargar los items:', error);
        this.notification.error('No tienes permisos para ver esto o no has iniciado sesión.');
      }
    );
  }
  loadDeletedItems(): void {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
  this.http.get<any[]>('http://localhost:8000/api/items/getdeleted', { headers }).subscribe(
    (items) => {
      console.log('Items eliminados cargados desde backend:', items);
      this.deletedItems = items.map(item => ({ ...item, editing: false }));
    },
    (error: HttpErrorResponse) => {
    }
  );
}

  deleteItem(item: any): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.delete(`http://localhost:8000/api/items/${item.id}`, { headers }).subscribe(
      () => {
        this.notification.success('Producto eliminado.');
        this.loadItems();
      this.loadDeletedItems();
      },
      (error: HttpErrorResponse) => {
        console.error('Error al eliminar el producto:', error);
        this.notification.error('No se pudo eliminar el producto.');
      }
    );
  }

  restoreItem(item: any): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.put(`http://localhost:8000/api/items/${item.id}/restore`, {}, { headers }).subscribe(
      () => {
        this.notification.success('Producto restaurado.');
        this.loadItems();
    this.deletedItems = [];
      this.loadDeletedItems();
      },
      (error: HttpErrorResponse) => {
        console.error('Error al restaurar el producto:', error);
        this.notification.error('No se pudo restaurar el producto.');
      }
    );
  }

  getUser(): void {
    if (!this.token) {
      this.notification.error('No hay token de autenticación. Por favor, inicia sesión.');
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
          this.notification.error('No autorizado. Por favor, inicia sesión nuevamente.');
          localStorage.removeItem('token');
        } else {
          this.notification.error('Error al obtener el usuario. Por favor, inténtalo de nuevo.');
        }
      }
    );
  }

  addItem(): void {
    if (this.item.image_urls.length === 0) {
      this.notification.warning('Por favor, sube al menos una imagen antes de agregar el item.');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.post('http://localhost:8000/api/items', this.item, { headers }).subscribe(
      () => {
        this.notification.success('¡Item agregado!');
        this.loadItems();
        this.resetForm();
      },
      (error: HttpErrorResponse) => {
        console.error('Error al agregar el item:', error);
        this.notification.warning('Error al agregar el item. Por favor, inténtalo de nuevo.');
      }
    );
  }

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
          this.notification.warning('Solo puedes subir hasta 4 imágenes por producto.');
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error al subir la imagen:', error);
        this.notification.error('Error al subir la imagen.');
      }
    );
  }

  resetForm(): void {
    this.item = {
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      image_urls: [],
    };
  }

  toggleEdit(item: any): void {
    item.editing = !item.editing;
  }

  updateItem(item: any): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    this.http.put(`http://localhost:8000/api/items/${item.id}`, item, { headers }).subscribe(
      () => {
        item.editing = false;
        this.loadItems();
      },
      (error: HttpErrorResponse) => {
        console.error('Error al actualizar el item:', error);
        this.notification.error('Error al actualizar el item. Por favor, inténtalo de nuevo.');
      }
    );
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onPageChangeDeleted(page: number): void {
    this.deletedPage = page;
  }
}
