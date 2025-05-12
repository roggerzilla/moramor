export interface Address {
    id: number;
    street: string;
    number?: string;
    city: string;
    state: string;
    zip_code: string;  // Asegúrate que coincida con tu backend
    country: string;
    is_default?: boolean;
    [key: string]: any; // Para propiedades adicionales
  }