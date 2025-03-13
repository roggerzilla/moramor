import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css'],
})
export class VerifyEmailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const hash = this.route.snapshot.paramMap.get('hash');

    if (id && hash) {
      this.authService.verifyEmail(id, hash).subscribe({
        next: (response) => {
          console.log('Correo verificado correctamente', response);
          // Redirige al usuario a una página de confirmación
          this.router.navigate(['/email-verified']);
        },
        error: (err) => {
          console.error('Error al verificar el correo', err);
          // Redirige al usuario a una página de error
          this.router.navigate(['/verification-error']);
        },
      });
    } else {
      console.error('Faltan parámetros en la URL');
      this.router.navigate(['/verification-error']);
    }
  }
}