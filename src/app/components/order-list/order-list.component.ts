import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];

  // Filtros
  searchId: string = '';
  searchName: string = '';
  startDate: string = '';
  endDate: string = '';
  searchItem: string = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe(
      (orders: Order[]) => {
        this.orders = orders;
        this.filteredOrders = orders; // Mostrar todos los pedidos al inicio
      },
      (error) => {
        console.error('Error al cargar los pedidos:', error);
      }
    );
  }

  // Aplicar filtros
  applyFilters(): void {
    this.filteredOrders = this.orders.filter((order) => {
      const matchesId = this.searchId
        ? order.id.toString().includes(this.searchId)
        : true;
  
      const matchesName = this.searchName
        ? order.customer_name.toLowerCase().includes(this.searchName.toLowerCase())
        : true;
  
      // Convertir la fecha de la orden a un objeto Date
      const orderDate = new Date(order.created_at);
  
      // Convertir las fechas de inicio y fin a objetos Date
      const startDate = this.startDate ? new Date(this.startDate) : null;
      let endDate = this.endDate ? new Date(this.endDate) : null;
  
      // Sumar 1 día a la fecha final para incluir el día completo
      if (endDate) {
        endDate.setDate(endDate.getDate() + 2); // Sumar 1 día
      }
  
      // Comparar las fechas
      const matchesDate =
        (!startDate || orderDate >= startDate) &&
        (!endDate || orderDate < endDate); // Usar "<" en lugar de "<="
  
      const matchesItem = this.searchItem
        ? order.items.some((item) =>
            item.name.toLowerCase().includes(this.searchItem.toLowerCase())
          )
        : true;
  
      return matchesId && matchesName && matchesDate && matchesItem;
    });
  }
  
  
}
