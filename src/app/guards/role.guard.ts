import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.userService.getUserInfo().pipe(
      map(user => {
        if (!user) {
          console.warn('Acceso denegado: Usuario no autenticado');
          this.router.navigate(['/login']);
          return false;
        }

        const expectedRoles: string[] = route.data['expectedRoles'] || [];
        const userRole = user.role; // Aquí obtenemos el rol del usuario desde la API

        if (expectedRoles.includes(userRole)) {
          return true;
        }

        console.warn('Acceso denegado: Rol no autorizado');
        this.router.navigate(['/home']); // Redirigir a home si no tiene permiso
        return false;
      }),
      catchError(error => {
        console.error('Error obteniendo la información del usuario:', error);
        this.router.navigate(['/login']);
        return [false];
      })
    );
  }
}
