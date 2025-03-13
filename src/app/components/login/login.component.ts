import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // 🔥 Asegúrate de importar el servicio

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: ''
})
export class LoginComponent {

}