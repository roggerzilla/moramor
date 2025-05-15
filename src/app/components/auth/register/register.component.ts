import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { UserStoreService } from '../../../services/user-store.service'; 
import { Router } from '@angular/router';


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

  constructor(private authService: AuthService, private notification: NotificationService, private userStore: UserStoreService,  private router: Router
  ) {}

  onRegister() {
    // Verificar que las contraseñas coincidan
    if (this.user.password !== this.user.password_confirmation) {
      this.passwordMismatch = true;
      return; // Detener el registro si no coinciden
    }

    this.passwordMismatch = false; // Resetear el mensaje de error

    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.userStore.setEmail(this.user.email);
        console.log('Registro exitoso', response);
        this.notification.success('Registro exitoso. Por favor, verifica tu correo electrónico.');
        this.router.navigateByUrl('/correo-enviado');
            },
      error: (err) => {
        console.error('Error en registro', err);
        if (err.error && err.error.message) {
          this.notification.error(`Error: ${err.error.message}`);
        } else {
          this.notification.error('Error en el registro. Por favor, inténtalo de nuevo.');
        }
      },
    });
  }
}