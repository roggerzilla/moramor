import { Component, OnInit } from '@angular/core';
import { UserStoreService } from '../../services/user-store.service'; 

@Component({
  selector: 'app-correo-eviado',
  imports: [],
  templateUrl: './correo-eviado.component.html',
  styleUrl: './correo-eviado.component.css'
})
export class CorreoEviadoComponent implements OnInit {
  email: string | null = null;

  constructor(private userStore: UserStoreService) {}

  ngOnInit(): void {
    this.email = this.userStore.getEmail(); // Obtiene el correo
    console.log(this.email)
  }
}
