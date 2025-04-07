import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient,withInterceptors  } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/AuthInterceptor';
import { provideNgxStripe } from 'ngx-stripe';
import { provideAnimations } from '@angular/platform-browser/animations';
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])), // Proporciona HttpClient
    provideRouter(routes), // Configura las rutas
    provideNgxStripe(),
    provideAnimations(),
    
  ],
}).catch((err) => console.error(err));