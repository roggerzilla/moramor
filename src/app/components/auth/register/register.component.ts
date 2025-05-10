import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterOutlet, RouterLink, RouterLinkActive,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  user = { name: '', email: '', password: '', password_confirmation: '' };
  passwordMismatch = false;

  constructor(private authService: AuthService) {}

  onRegister() {
    // Verificar que las contraseñas coincidan
    if (this.user.password !== this.user.password_confirmation) {
      this.passwordMismatch = true;
      return; // Detener el registro si no coinciden
    }

    this.passwordMismatch = false; // Resetear el mensaje de error

    this.authService.register(this.user).subscribe({
      next: (response) => {
        console.log('Registro exitoso', response);
        alert('Registro exitoso. Por favor, verifica tu correo electrónico.');
        window.location.replace('http://localhost:4200/home');
      },
      error: (err) => {
        console.error('Error en registro', err);
        if (err.error && err.error.message) {
          alert(`Error: ${err.error.message}`);
        } else {
          alert('Error en el registro. Por favor, inténtalo de nuevo.');
        }
      },
    });
  }
}