import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-exitoso',
  imports: [],
  templateUrl: './exitoso.component.html',
  styleUrl: './exitoso.component.css'
})
export class ExitosoComponent {

    constructor(private router: Router) { }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
