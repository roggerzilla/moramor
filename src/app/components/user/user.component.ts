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
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  user: any = null;
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

  addAddress(): void {
    if (!this.token) {
      alert('Debes iniciar sesión.');
      return;
    }

    const { country, postal_code, city, state } = this.newAddress;

    if (!country || !postal_code || !city || !state) {
      alert('Completa todos los campos antes de validar.');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const countryCode = country.toLowerCase();

    // 🔍 Validar con Zippopotam.us
    this.http.get(`https://api.zippopotam.us/${countryCode}/${postal_code}`).subscribe({
      next: (data: any) => {
        const validPlace = data.places[0];
        const expectedCity = validPlace['place name'];
        const expectedState = validPlace['state'];

        if (expectedCity.toLowerCase() !== city.toLowerCase() ||
            expectedState.toLowerCase() !== state.toLowerCase()) {
          alert(`La ciudad o el estado no coinciden con el código postal.\nEsperado: ${expectedCity}, ${expectedState}`);
          return;
        }

        // ✅ Si todo está bien, enviar al backend
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
      },
      error: () => {
        alert('El código postal no fue encontrado para ese país.');
      }
    });
  }
}
