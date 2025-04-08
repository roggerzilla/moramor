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
    provideNgxStripe('pk_test_51RBMauP5YAunVj6pbcfSdzr2XUkhkd6ryGfqqL0rdOCv3d2YtVZRIvwaMcQVL1uZcmoswy2sXD3OwEfN0eCW2K9v00N7oPp1qB'),
    
  ],
}).catch((err) => console.error(err));