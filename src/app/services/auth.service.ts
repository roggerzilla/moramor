import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response';
import { environment } from '../../environments/environment'; // Añadido

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) {}

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  registerAdmin(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registerAdmin`, user);
  }

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
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

  getCurrentUser() {
    return this.http.get<{ id: number; name: string }>(`${this.apiUrl}/user`);
  }
}