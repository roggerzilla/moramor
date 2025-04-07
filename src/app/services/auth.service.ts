import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response';

@Injectable({
  providedIn: 'root', // Asegúrate de que esté proporcionado globalmente
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api'; // URL de Laravel

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  registerAdmin(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registerAdmin`, user);
  }
// En tu servicio de autenticación (auth.service.ts)
login(credentials: { email: string, password: string }): Observable<any> {
  return this.http.post('http://localhost:8000/api/login', credentials).pipe(
    tap((response: any) => {
      // Guardar el token en el localStorage
      localStorage.setItem('authToken', response.token);
    })
  );
}
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }
  verifyEmail(id: string, hash: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/email/verify/${id}/${hash}`);
  }

  
}