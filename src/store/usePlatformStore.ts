"use client";

import { create } from "zustand";
import {
  DEFAULT_PLATFORM_SETTINGS,
  setPlatformName,
  type PlatformSettings,
} from "@/lib/platform";
import { api } from "@/lib/api";

export { DEFAULT_PLATFORM_SETTINGS, type PlatformSettings };
export { getPlatformName } from "@/lib/platform";

interface PlatformStore {
  settings: PlatformSettings;
  loadSettings: () => Promise<void>;
  updateSettings: (data: Partial<PlatformSettings>) => Promise<{ success: boolean; error?: string }>;
}

export const usePlatformStore = create<PlatformStore>((set) => ({
  settings: { ...DEFAULT_PLATFORM_SETTINGS },

  loadSettings: async () => {
    try {
      const { settings } = await api.getPlatform();
      setPlatformName(settings.platformName);
      set({ settings });
    } catch {
      /* تجاهل */
    }
  },

  updateSettings: async (data) => {
    try {
      const { settings } = await api.updatePlatform(data);
      setPlatformName(settings.platformName);
      set({ settings });
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
}));
