export type UserRole = "admin" | "store_owner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
  createdAt: string;
}

export type StoreStatus = "active" | "inactive";

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  enabled: boolean;
  connectedAt?: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  brandName?: string;
  description: string;
  logo?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  status: StoreStatus;
  category: string;
  productsCount: number;
  ordersCount: number;
  revenue: number;
  stripe?: StripeConfig;
  createdAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
  images?: string[];
  category: string;
  createdAt: string;
}

export interface Order {
  id: string;
  storeId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCity?: string;
  customerAddress?: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}
