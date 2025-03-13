export interface CartItem {
  id: number;
  user_id: number;
  item_id: number;
  quantity: number;
  item: {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
  };
}