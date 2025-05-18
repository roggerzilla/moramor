import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment'; // Añadido

@Component({
  selector: 'app-editar-item',
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './editar-item.component.html',
  styleUrl: './editar-item.component.css'
})
export class EditarItemComponent implements OnInit {
  private apiUrl = environment.apiUrl; // Añadido
  itemId: number | undefined;
  item: any = { name: '', description: '', price: 0, quantity: 0 };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemId = +this.route.snapshot.paramMap.get('id')!;
    this.getItem();
  }

  // Método para obtener un item
  getItem(): void {
    this.http.get(`${this.apiUrl}/items/${this.itemId}`).subscribe( // Modificado
      (data) => {
        this.item = data;
      },
      (error) => {
        console.error('Error obteniendo el item:', error);
      }
    );
  }

  // Método para actualizar el item
  onSave(): void {
    this.http.put(`${this.apiUrl}/items/${this.itemId}`, this.item).subscribe( // Modificado
      (response) => {
        console.log('Item actualizado', response);
        this.router.navigate(['/inventario']);
      },
      (error) => {
        console.error('Error al actualizar el item:', error);
      }
    );
  }
}