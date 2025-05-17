import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserStoreService {
  private token = '';
  private email = '';
  private name = '';

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  setEmail(email: string) {
    this.email = email;
    localStorage.setItem('email', email);
  }

  setName(name: string) {
    this.name = name;
    localStorage.setItem('name', name);
  }

  getToken() {
    return this.token || localStorage.getItem('token');
  }

  getEmail() {
    return this.email || localStorage.getItem('email');
  }

  getName() {
    return this.name || localStorage.getItem('name');
  }
}