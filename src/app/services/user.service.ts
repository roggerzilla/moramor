import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Address } from '../models/address.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api'; // Cambia esto según tu backend

  constructor(private http: HttpClient) {}

  // ✅ Método para obtener el token desde el localStorage
  getToken(): string | null {
    const token = localStorage.getItem('token'); // Asegúrate de que el token se guarde como 'auth_token'
    console.log("token servicio",token)
    console.log('Token obtenido del localStorage:', token); // Log del token
    return token;
  }

  // ✅ Método para obtener la información del usuario autenticado desde el backend
  getUserInfo(): Observable<any> {
    console.log('Iniciando getUserInfo...'); // Log de inicio del método

    const token = this.getToken();
    if (!token) {
      console.error('Token no disponible en getUserInfo'); // Log de error
      return throwError('Token no disponible');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Headers enviados:', headers); // Log de los headers

    console.log('Realizando solicitud GET a /user...'); // Log antes de la solicitud
    return this.http.get(`${this.apiUrl}/user`, { headers }).pipe(
      tap((response) => {
        console.log('Respuesta del backend en getUserInfo:', response); // Log de la respuesta del backend
      }),
      catchError((error) => {
        console.error('Error en getUserInfo:', error); // Log de error
        return throwError('Error al obtener la información del usuario');
      })
    );
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/profile`, data);
  }
  getUserAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/user/addresses`);
  }
  getCurrentUser() {
    return this.http.get<{ id: number; name: string }>(`${this.apiUrl}/user`);
  }
saveAddress(addressData: any) {
  return this.http.post<any>(`${this.apiUrl}/user/address`, addressData);
}

} 