import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit {
  private http = inject(HttpClient);
  users: any[] = []; // Lista de usuarios activos
  deletedUsers: any[] = []; // Lista de usuarios eliminados
  user = { name: '', email: '', password: '', password_confirmation: '', role: 'admin' };
  editingUser: any = null; // Usuario en edición

  constructor(private authService: AuthService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadDeletedUsers();
  }

  // Cargar la lista de usuarios activos
  loadUsers(): void {
    this.http.get<any[]>('http://localhost:8000/api/admins').subscribe(
      (response) => {
        this.users = response;
      },
      (error) => {
        console.error('Error al cargar los usuarios:', error);
      }
    );
  }

  // Cargar la lista de usuarios eliminados
  loadDeletedUsers(): void {
    this.http.get<any[]>('http://localhost:8000/api/admins/deleted').subscribe(
      (response) => {
        this.deletedUsers = response;
      },
      (error) => {
        console.error('Error al cargar los usuarios eliminados:', error);
      }
    );
  }

  // Registrar un nuevo usuario
  createUser(): void {
    this.authService.registerAdmin(this.user).subscribe({
      next: (response) => {
        console.log('Registro exitoso', response);
        this.notification.success('Registro exitoso.');
        this.loadUsers(); // Recargar la lista de usuarios
        this.resetForm(); // Reiniciar el formulario
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

  // Eliminar un usuario (soft delete)
  deleteUser(id: number): void {
    this.http.delete(`http://localhost:8000/api/admins/${id}`).subscribe(
      () => {
        this.notification.error('Usuario eliminado correctamente');
        this.loadUsers(); // Recargar la lista de usuarios activos
        this.loadDeletedUsers(); // Recargar la lista de usuarios eliminados
      },
      (error) => {
        console.error('Error al eliminar el usuario:', error);
        this.notification.error('Error al eliminar el usuario.');
      }
    );
  }

  // Restaurar un usuario eliminado
  restoreUser(id: number): void {
    this.http.post(`http://localhost:8000/api/admins/${id}/restore`, {}).subscribe(
      () => {
        this.notification.success('Usuario restaurado correctamente');
        this.loadUsers(); // Recargar la lista de usuarios activos
        this.loadDeletedUsers(); // Recargar la lista de usuarios eliminados
      },
      (error) => {
        console.error('Error al restaurar el usuario:', error);
        this.notification.error('Error al restaurar el usuario.');
      }
    );
  }

  // Editar un usuario
  editUser(user: any): void {
    this.editingUser = { ...user }; // Copia el usuario para editarlo
  }

  // Actualizar un usuario
  updateUser(): void {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    this.http.put(`http://localhost:8000/api/admins/${this.editingUser.id}`, this.editingUser, { headers }).subscribe(
      () => {
        this.notification.success('Usuario actualizado correctamente');
        this.loadUsers(); // Recargar la lista de usuarios
        this.cancelEdit(); // Cancelar la edición
      },
      (error) => {
        console.error('Error al actualizar el usuario:', error);
        this.notification.error('Error al actualizar el usuario.');
      }
    );
  }

  // Cancelar la edición
  cancelEdit(): void {
    this.editingUser = null;
  }

  // Reiniciar el formulario
  resetForm(): void {
    this.user = { name: '', email: '', password: '', password_confirmation: '', role: 'admin' };
  }
}