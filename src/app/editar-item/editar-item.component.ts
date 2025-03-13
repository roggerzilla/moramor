import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-editar-item',
  imports: [HttpClientModule,FormsModule,CommonModule],
  templateUrl: './editar-item.component.html',
  styleUrl: './editar-item.component.css'
})
export class EditarItemComponent implements OnInit {
  itemId: number | undefined;
  item: any = { name: '', description: '', price: 0, quantity: 0 };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemId = +this.route.snapshot.paramMap.get('id')!; // Asegúrate de manejar el caso null de paramMap
    this.getItem();
  }

  // Método para obtener un item
  getItem(): void {
    this.http.get(`http://localhost:8000/api/items/${this.itemId}`).subscribe(
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
    this.http.put(`http://localhost:8000/api/items/${this.itemId}`, this.item).subscribe(
      (response) => {
        console.log('Item actualizado', response);
        this.router.navigate(['/inventario']); // Redirigir al inventario después de actualizar
      },
      (error) => {
        console.error('Error al actualizar el item:', error);
      }
    );
  }
}