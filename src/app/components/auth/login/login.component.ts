import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule], // Asegúrate de que FormsModule esté aquí
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  user = { email: '', password: '' }; // Inicializa el objeto user

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    console.log('Formulario enviado'); // Verifica que el método se llame
    console.log('Email:', this.user.email); // Verifica el valor de email
    console.log('Password:', this.user.password); // Verifica el valor de password

    const credentials = { email: this.user.email, password: this.user.password };
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        localStorage.setItem('token', response.token);
        const storedToken = localStorage.getItem('token');
      console.log('Token guardado en localStorage:', storedToken);
      window.location.replace('http://localhost:4200/home');
       // this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error en login', err);
      },
    });
  }
}