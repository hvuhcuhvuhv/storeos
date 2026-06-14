export const DEFAULT_PLATFORM_SETTINGS = {
  platformName: "منصة سند",
  supportEmail: "support@sanad.com",
  allowNewStores: true,
  notifications: true,
} as const;

export type PlatformSettings = {
  platformName: string;
  supportEmail: string;
  allowNewStores: boolean;
  notifications: boolean;
};

// ذاكرة مؤقتة لاسم المنصة لاستخدامها في سياقات غير تفاعلية (مثل تصدير Excel)
let cachedPlatformName: string = DEFAULT_PLATFORM_SETTINGS.platformName;

export function setPlatformName(name: string) {
  if (name && name.trim()) cachedPlatformName = name.trim();
}

export function getPlatformName(): string {
  return cachedPlatformName || DEFAULT_PLATFORM_SETTINGS.platformName;
}
