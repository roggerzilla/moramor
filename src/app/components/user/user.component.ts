import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Address {
  id?: number;
  street: string;
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
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  user: any = { name: '', email: '' };
  password: string = '';
  updateMessage: string = '';
  addresses: Address[] = [];
  token: string | null = null;

  newAddress: Address = {
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    if (!this.token) {
      alert('Debes iniciar sesión.');
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
      alert('Debes iniciar sesión.');
      return;
    }

    const { country, postal_code, city, state, street } = this.newAddress;

    if (!country || !postal_code || !city || !state || !street) {
      alert('Completa todos los campos antes de guardar.');
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
        alert('Dirección agregada correctamente');
        this.addresses.push(response.address ?? this.newAddress);
        this.newAddress = {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: ''
        };
      },
      error: (err) => {
        console.error('Error al agregar dirección', err);
        alert('Error al agregar dirección.');
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
        address.editing = false;
        alert('Dirección actualizada correctamente');
      },
      error: (err) => {
        console.error('Error al actualizar dirección', err);
        alert('Error al actualizar dirección.');
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
        alert('Dirección eliminada correctamente');
      },
      error: (err) => {
        console.error('Error al eliminar dirección', err);
        alert('Error al eliminar dirección.');
      }
    });
  }
  
}
