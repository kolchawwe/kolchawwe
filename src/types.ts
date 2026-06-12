/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'IPA' | 'Stout' | 'Lager' | 'Amber' | 'Belgian';
  price: number;
  stock: number;
  image: string;
  abv: number; // Alcohol By Volume
  ibu: number; // International Bitterness Units
  volume: string; // e.g. "330cc", "500cc"
  hidden?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingConfig {
  basePrice: number;
  freeShippingThreshold: number;
  communes?: { name: string; price: number }[];
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  address: string;
  commune: string;
  phone: string;
  notes?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  shippingDetails: ShippingDetails;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'Pendiente' | 'Despachado' | 'Entregado';
  paymentId: string;
}

export interface Client {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  commune: string;
}

export interface EmailLog {
  id: string;
  date: string;
  toEmail: string;
  sender: string;
  subject: string;
  body: string;
  orderId?: string;
  status: 'Sent' | 'Simulated' | 'Failed';
  errorMessage?: string;
}


