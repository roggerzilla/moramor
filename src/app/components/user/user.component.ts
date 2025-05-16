import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';

interface Address {
  id?: number;
  street: string;
  address2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  editing?: boolean;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  user: any = { name: '', email: '' };
  password: string = '';
  updateMessage: string = '';
  addresses: Address[] = [];
  token: string | null = null;

  newAddress: Address = {
    street: '',
    address2: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  };
  addressMode: 'saved' | 'new' = 'saved';

  selectedAddress: Address | null = null;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private notification: NotificationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    if (!this.token) {
      this.notification.warning('Debes iniciar sesión.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json'
    });

    this.http.get('http://localhost:8000/api/user', { headers }).subscribe({
      next: (data) => (this.user = data),
      error: (err) => console.error(err)
    });

    this.http.get('http://localhost:8000/api/user/addresses', { headers }).subscribe({
      next: (data: any) => {
        this.addresses = data ?? [];
        if (this.addresses.length > 0) {
          this.selectedAddress = JSON.parse(JSON.stringify(this.addresses[0]));
        }
      },
      error: (err) => console.error(err)
    });
  }

  updateProfile(): void {
    if (!this.token) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const body = {
      name: this.user.name,
      email: this.user.email,
      password: this.password || null
    };

    this.http.put('http://localhost:8000/api/user/profile', body, { headers }).subscribe({
      next: (res: any) => {
        this.updateMessage = 'Perfil actualizado correctamente';
        this.password = '';
      },
      error: (err) => {
        console.error(err);
        this.updateMessage = 'Error al actualizar perfil';
      }
    });
  }

  addAddress(): void {
    if (!this.token) {
      this.notification.warning('Debes iniciar sesión.');
      return;
    }

    const { country, postal_code, city, state, street } = this.newAddress;

    if (!country || !postal_code || !city || !state || !street) {
      this.notification.info('Completa todos los campos antes de guardar.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    this.http.post('http://localhost:8000/api/user/address', this.newAddress, {
      headers
    }).subscribe({
      next: (response: any) => {
        this.notification.success('Dirección agregada correctamente');
        this.addresses.push(response.address ?? this.newAddress);
        this.newAddress = {
          street: '',
          address2: '',
          city: '',
          state: '',
          postal_code: '',
          country: ''
        };
      },
      error: (err) => {
        console.error('Error al agregar dirección', err);
        this.notification.error('Error al agregar dirección.');
      }
    });
  }

  updateAddress(address: Address): void {
    if (!this.token || !address.id) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    this.http.put(`http://localhost:8000/api/user/address/${address.id}`, address, { headers }).subscribe({
      next: (res: any) => {
        this.notification.success('Dirección actualizada correctamente');

        const index = this.addresses.findIndex(a => a.id === address.id);
        if (index !== -1) {
          this.addresses[index] = JSON.parse(JSON.stringify(address));
        }
      },
      error: (err) => {
        console.error('Error al actualizar dirección', err);
        this.notification.error('Error al actualizar dirección.');
      }
    });
  }

  deleteAddress(address: Address): void {
    if (!this.token || !address.id) return;

    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar esta dirección?');
    if (!confirmDelete) return;

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json'
    });

    this.http.delete(`http://localhost:8000/api/user/address/${address.id}`, { headers }).subscribe({
      next: () => {
        this.addresses = this.addresses.filter(a => a.id !== address.id);
        this.notification.success('Dirección eliminada correctamente');

        if (this.selectedAddress?.id === address.id) {
          this.selectedAddress = this.addresses.length > 0 ? JSON.parse(JSON.stringify(this.addresses[0])) : null;
        }
      },
      error: (err) => {
        console.error('Error al eliminar dirección', err);
        this.notification.error('Error al eliminar dirección.');
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  onAddressChange(): void {
    if (this.selectedAddress) {
      this.selectedAddress = JSON.parse(JSON.stringify(this.selectedAddress));
    }
  }

  saveSelectedAddress(): void {
    if (!this.selectedAddress) {
      this.notification.info('Selecciona una dirección primero.');
      return;
    }
    this.updateAddress(this.selectedAddress);
  }

  compareAddress(a: Address, b: Address): boolean {
    return a && b ? a.id === b.id : a === b;
  }
}
