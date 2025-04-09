import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  user = { name: '', email: '', password: '', password_confirmation: '' };

  constructor(private authService: AuthService) {}

  onRegister() {
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