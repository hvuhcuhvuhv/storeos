export const PLATFORM_STORAGE_KEY = "storeos-platform";

export const DEFAULT_PLATFORM_SETTINGS = {
  platformName: "StoreOS",
  supportEmail: "support@storeos.com",
  allowNewStores: true,
  notifications: true,
} as const;

export type PlatformSettings = {
  platformName: string;
  supportEmail: string;
  allowNewStores: boolean;
  notifications: boolean;
};

export function getPlatformName(): string {
  if (typeof window === "undefined") return DEFAULT_PLATFORM_SETTINGS.platformName;

  try {
    const raw = localStorage.getItem(PLATFORM_STORAGE_KEY);
    if (!raw) return DEFAULT_PLATFORM_SETTINGS.platformName;
    const data = JSON.parse(raw) as { state?: { settings?: { platformName?: string } } };
    return data.state?.settings?.platformName?.trim() || DEFAULT_PLATFORM_SETTINGS.platformName;
  } catch {
    return DEFAULT_PLATFORM_SETTINGS.platformName;
  }
}
