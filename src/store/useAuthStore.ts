"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import {
  PERSIST_VERSION,
  getFreshAuthState,
  type StoredUser,
} from "@/lib/defaults";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  users: StoredUser[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  registerStoreOwner: (data: {
    name: string;
    email: string;
    password: string;
    storeId: string;
  }) => { success: boolean; error?: string };
}

const fresh = getFreshAuthState();

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: fresh.user,
      isAuthenticated: fresh.isAuthenticated,
      users: fresh.users,

      login: async (email: string, password: string) => {
        await new Promise((r) => setTimeout(r, 800));
        const found = get().users.find(
          (u) => u.email === email && u.password === password
        );
        if (found) {
          const { password: _, ...userWithoutPassword } = found;
          set({ user: userWithoutPassword, isAuthenticated: true });
          return { success: true };
        }
        return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      registerStoreOwner: ({ name, email, password, storeId }) => {
        const existing = get().users.find((u) => u.email === email);
        if (existing) {
          return { success: false, error: "البريد الإلكتروني مسجل مسبقاً" };
        }

        const newUser: StoredUser = {
          id: `user-${Date.now()}`,
          name,
          email,
          password,
          role: "store_owner",
          storeId,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ users: [...state.users, newUser] }));
        return { success: true };
      },
    }),
    {
      name: "storeos-auth",
      version: PERSIST_VERSION,
      migrate: () => getFreshAuthState(),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        users: state.users,
      }),
      skipHydration: true,
    }
  )
);
