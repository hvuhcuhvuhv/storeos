"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PERSIST_VERSION } from "@/lib/defaults";
import {
  DEFAULT_PLATFORM_SETTINGS,
  PLATFORM_STORAGE_KEY,
  type PlatformSettings,
} from "@/lib/platform";

export { DEFAULT_PLATFORM_SETTINGS, type PlatformSettings };
export { getPlatformName } from "@/lib/platform";

interface PlatformStore {
  settings: PlatformSettings;
  updateSettings: (data: Partial<PlatformSettings>) => void;
}

export const usePlatformStore = create<PlatformStore>()(
  persist(
    (set) => ({
      settings: { ...DEFAULT_PLATFORM_SETTINGS },

      updateSettings: (data) =>
        set((state) => ({
          settings: { ...state.settings, ...data },
        })),
    }),
    {
      name: PLATFORM_STORAGE_KEY,
      version: PERSIST_VERSION,
      skipHydration: true,
    }
  )
);
