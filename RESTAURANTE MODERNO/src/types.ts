export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'noche' | 'bebidas' | 'entrada' | 'postres';
  image: string;
  available: boolean;
}

export interface SiteConfig {
  businessName: string;
  logoUrl: string;
  phone: string;
  address: string;
  slogan: string;
  aboutText?: string;
  aboutImage1?: string;
  aboutImage2?: string;
}

export interface BusinessInfo {
  businessName: string;
  logoUrl: string;
  phone: string;
  address: string;
  slogan: string;
  aboutText?: string;
  aboutImage1?: string;
  aboutImage2?: string;
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  type: 'noche';
  notes: string;
  status: 'pendiente' | 'confirmada' | 'rechazada';
  createdAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  orderType: 'llevar' | 'local';
  notes: string;
  status: 'pendiente' | 'preparando' | 'completado' | 'cancelado';
  createdAt: string;
}
