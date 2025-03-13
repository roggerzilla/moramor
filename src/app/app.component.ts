import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { FormsModule } from '@angular/forms'; // Si usas [(ngModel)]
import { GeolocationService } from './services/geolocation.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive,CommonModule,FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  showAgeVerificationModal: boolean = false;

  ngOnInit(): void {
    this.checkAgeVerification();
    this.getLocation();
  }

  constructor(private geolocationService: GeolocationService, private http: HttpClient) {}

  // Verificar si el usuario ya ha respondido a la pregunta
  checkAgeVerification(): void {
    const hasConfirmedAge = localStorage.getItem('hasConfirmedAge');

    if (hasConfirmedAge !== 'true') {
      this.showAgeVerificationModal = true;
    }
  }

  // Manejar la respuesta del usuario
  confirmAge(isOfAge: boolean): void {
    if (isOfAge) {
      localStorage.setItem('hasConfirmedAge', 'true');
      this.showAgeVerificationModal = false;
    } else {
      // Redirigir o mostrar un mensaje si el usuario no es mayor de 18 años
      window.location.href = 'https://www.google.com'; // Redirige a otra página
    }
  }
  getLocation() {
    console.log('hola')
    this.geolocationService.getCurrentPosition()
      .then(position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Enviar la ubicación al backend
        this.http.post('/api/location', { latitude, longitude })
          .subscribe(response => {
            console.log('Location sent to backend:', response);
          }, error => {
            console.error('Error sending location to backend:', error);
          });
      })
      .catch(error => {
        console.error('Error getting location:', error);
      });
  }
}