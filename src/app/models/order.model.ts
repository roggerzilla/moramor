// models/order.model.ts

export interface Order {
  id: number;
  user_id: number;
  customer_name: string;
  total: number;
  estatus: string; // Agregar el campo estatus
  created_at: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
}