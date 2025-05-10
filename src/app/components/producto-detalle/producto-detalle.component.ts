import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../services/inventory.service';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.css']
})
export class ProductoDetalleComponent implements OnInit {
  productId: string | null = '';
  product: any;
  selectedImage: string | null = null;
  cantidad: number = 1;

  token = localStorage.getItem('token');
  private cartService = inject(CartService);

  constructor(
    private route: ActivatedRoute,
    private productoService: InventoryService
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.getProductDetails(this.productId);
    }
  }

  getProductDetails(id: string): void {
    this.productoService.getProductoById(id).subscribe((data) => {
      this.product = data;
      
      // Si las imágenes existen en el objeto product, asignarlas
      if (this.product && this.product.images && this.product.images.length > 0) {
        this.selectedImage = this.product.images[0].url; // Selecciona la primera imagen por defecto
      }
    });
  }

  // Aquí las imágenes vendrán directamente del producto
  get allImages(): string[] {
    return this.product ? this.product.images.map((img: any) => img.url) : [];
  }

  agregarAlCarrito(): void {
    const quantityNum = Number(this.cantidad);

    if (!this.token) {
      alert('Debes iniciar sesión para comprar.');
      return;
    }

    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Ingresa una cantidad válida.');
      return;
    }

    if (quantityNum > this.product.quantity) {
      alert('No hay suficiente stock para la compra.');
      return;
    }

    this.cartService.addToCart(this.product.id, quantityNum).subscribe({
      next: () => {
        alert('Producto agregado al carrito');
        
        // Obtén el carrito actualizado desde el servicio y actualiza el estado
        this.cartService.getCartItems().subscribe(cartItems => {
          this.cartService.updateCartState(cartItems); // Actualiza el carrito en el servicio
        });
      },
      error: (error) => {
        console.error('Error al agregar al carrito:', error);
        alert('Error al agregar el producto.');
      }
    });
    
  }
}
