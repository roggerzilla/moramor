export interface Order {
    id: number;
    user_id: number;
    customer_name: string; // Nombre del cliente
    total: number;
    created_at: string; // Fecha del pedido
    items: {
      id: number;
      name: string;
      quantity: number;
      price: number;
    }[];
  }