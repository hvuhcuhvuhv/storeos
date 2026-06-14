"use client";

import { create } from "zustand";
import { User } from "@/types";
import { api } from "@/lib/api";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  users: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<User | null>;
  loadUsers: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  users: [],

  login: async (email, password) => {
    try {
      const { user } = await api.login(email, password);
      set({ user, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },

  logout: async () => {
    try {
      await api.logout();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchMe: async () => {
    try {
      const { user } = await api.me();
      set({ user, isAuthenticated: Boolean(user), loading: false });
      return user;
    } catch {
      set({ loading: false });
      return null;
    }
  },

  loadUsers: async () => {
    try {
      const { users } = await api.getUsers();
      set({ users });
    } catch {
      /* تجاهل */
    }
  },
}));
