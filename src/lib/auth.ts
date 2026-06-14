import { User } from "@/types";
import { generateSlug } from "@/lib/utils";
import { Store } from "@/types";

export const ADMIN_CREDENTIALS = {
  email: "admin@storeos.com",
  password: "admin123",
};

export const DEMO_STORES: Store[] = [
  {
    id: "store-1",
    name: "متجر الإلكترونيات",
    brandName: "TechZone",
    slug: "electronics-store",
    description: "أفضل منتجات الإلكترونيات والتقنية",
    ownerId: "user-2",
    ownerName: "أحمد محمد",
    ownerEmail: "ahmed@store.com",
    ownerPhone: "+971501234567",
    status: "active",
    category: "إلكترونيات",
    productsCount: 45,
    ordersCount: 128,
    revenue: 85400,
    stripe: {
      publishableKey: "pk_test_electronics_demo",
      secretKey: "sk_test_electronics_demo",
      enabled: true,
      connectedAt: "2024-01-20T10:00:00Z",
    },
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "store-2",
    name: "متجر الأزياء",
    brandName: "FashionHub",
    slug: "fashion-store",
    description: "أحدث صيحات الموضة والأزياء",
    ownerId: "user-3",
    ownerName: "سارة العلي",
    ownerEmail: "sara@store.com",
    ownerPhone: "+971502345678",
    status: "active",
    category: "أزياء",
    productsCount: 92,
    ordersCount: 213,
    revenue: 47200,
    stripe: {
      publishableKey: "pk_test_fashion_demo",
      secretKey: "sk_test_fashion_demo",
      enabled: true,
      connectedAt: "2024-02-25T10:00:00Z",
    },
    createdAt: "2024-02-20T10:00:00Z",
  },
  {
    id: "store-3",
    name: "متجر المنزل",
    brandName: "HomeStyle",
    slug: "home-store",
    description: "كل ما يحتاجه منزلك من أثاث وديكور",
    ownerId: "user-4",
    ownerName: "خالد السالم",
    ownerEmail: "khalid@store.com",
    ownerPhone: "+971503456789",
    status: "inactive",
    category: "منزل وديكور",
    productsCount: 67,
    ordersCount: 89,
    revenue: 32100,
    stripe: {
      publishableKey: "",
      secretKey: "",
      enabled: false,
    },
    createdAt: "2024-03-10T12:00:00Z",
  },
];

export const DEMO_USERS: (User & { password: string })[] = [
  {
    id: "admin-1",
    name: "المدير العام",
    email: "admin@storeos.com",
    password: "admin123",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    name: "أحمد محمد",
    email: "ahmed@store.com",
    password: "ahmed123",
    role: "store_owner",
    storeId: "store-1",
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "user-3",
    name: "سارة العلي",
    email: "sara@store.com",
    password: "sara123",
    role: "store_owner",
    storeId: "store-2",
    createdAt: "2024-02-20T10:00:00Z",
  },
  {
    id: "user-4",
    name: "خالد السالم",
    email: "khalid@store.com",
    password: "khalid123",
    role: "store_owner",
    storeId: "store-3",
    createdAt: "2024-03-10T12:00:00Z",
  },
];

export function authenticateUser(email: string, password: string): User | null {
  const user = DEMO_USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) return null;
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export function createStoreUser(
  storeName: string,
  ownerName: string,
  email: string,
  password: string
): { user: User; store: Store } {
  const storeId = `store-${Date.now()}`;
  const userId = `user-${Date.now()}`;
  const slug = generateSlug(storeName);

  const store: Store = {
    id: storeId,
    name: storeName,
    slug,
    description: "",
    ownerId: userId,
    ownerName,
    ownerEmail: email,
    status: "active",
    category: "عام",
    productsCount: 0,
    ordersCount: 0,
    revenue: 0,
    stripe: { publishableKey: "", secretKey: "", enabled: false },
    createdAt: new Date().toISOString(),
  };

  const user: User = {
    id: userId,
    name: ownerName,
    email,
    role: "store_owner",
    storeId,
    createdAt: new Date().toISOString(),
  };

  return { user, store };
}
