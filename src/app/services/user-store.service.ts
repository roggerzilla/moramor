import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {

  private email: string | null = null;

  setEmail(email: string) {
    this.email = email;
  }

  getEmail(): string | null {
    return this.email;
  }

  clearEmail() {
    this.email = null;
  }
}