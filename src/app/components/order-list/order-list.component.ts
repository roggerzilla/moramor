import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
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
  searchStatus: string = '';

  // Paginación
  p: number = 1; // Usamos 'p' en lugar de 'currentPage'
  itemsPerPage: number = 10; // Puedes ajustar este valor

  constructor(
    private orderService: OrderService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe(
      (orders: Order[]) => {
        this.orders = orders;
        this.filteredOrders = orders;
        console.log('ordenes', orders);
      },
      (error) => {
        console.error('Error al cargar los pedidos:', error);
      }
    );
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter((order) => {
      const matchesId = this.searchId
        ? order.id.toString().includes(this.searchId)
        : true;

      const matchesName = this.searchName
        ? order.customer_name
            .toLowerCase()
            .includes(this.searchName.toLowerCase())
        : true;

      const orderDate = new Date(order.created_at);
      const startDate = this.startDate ? new Date(this.startDate) : null;
      let endDate = this.endDate ? new Date(this.endDate) : null;

      if (endDate) {
        endDate.setDate(endDate.getDate() + 2);
      }

      const matchesDate =
        (!startDate || orderDate >= startDate) &&
        (!endDate || orderDate < endDate);

      const matchesItem = this.searchItem
        ? order.items.some((item) =>
            item.name.toLowerCase().includes(this.searchItem.toLowerCase())
          )
        : true;

      const matchesStatus = this.searchStatus
        ? order.estatus === this.searchStatus
        : true;

      return (
        matchesId && matchesName && matchesDate && matchesItem && matchesStatus
      );
    });

    // Reiniciar a la primera página al aplicar filtros
    this.p = 1;
  }

  updateOrderStatus(order: Order): void {
    this.orderService.updateOrderStatus(order.id, order.estatus).subscribe(
      (response) => {
        this.notification.success('Estatus actualizado correctamente');
      },
      (error) => {
        console.error('Error al actualizar el estatus:', error);
        this.notification.error('Error al actualizar el estatus');
      }
    );
  }

  getStatusClass(estatus: string): string {
    switch (estatus) {
      case 'pedido':
        return 'status-pedido';
      case 'enviado':
        return 'status-enviado';
      case 'cancelado':
        return 'status-cancelado';
      default:
        return '';
    }
  }

  // Getter para obtener los elementos paginados
  get paginatedOrders(): Order[] {
    const startIndex = (this.p - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }
}
