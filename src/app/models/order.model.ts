// order.model.ts

export interface Address {
  street: string;
  address2:string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: number;
  user_id: number;
  customer_name: string;
  total: number;
  estatus: string;
  created_at: string;
  items: Item[];
  address: Address | null; // Agregar la propiedad address aquí
}

export interface Item {
  id: number;
  name: string;
  quantity: number;
  price: number;
}
