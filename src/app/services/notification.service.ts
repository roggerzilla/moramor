import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  success(message: string, title: string = 'Éxito') {
    Swal.fire({ icon: 'success', title, text: message });
  }

  error(message: string, title: string = 'Error') {
    Swal.fire({ icon: 'error', title, text: message });
  }

  warning(message: string, title: string = 'Advertencia') {
    Swal.fire({ icon: 'warning', title, text: message });
  }

  info(message: string, title: string = 'Información') {
    Swal.fire({ icon: 'info', title, text: message });
  }
}
