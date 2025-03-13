import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router); // Inyecta el Router
  const token = localStorage.getItem('token');

  // Clona la solicitud y agrega el token de autenticación
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Maneja la solicitud y captura errores
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        localStorage.removeItem('token'); // Elimina el token inválido
        router.navigate(['/login']); // Redirige al login si hay un error 401
      }
      return throwError(() => error);
    })
  );
};