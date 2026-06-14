"use client";

import { useEffect } from "react";
import { usePlatformStore } from "@/store/usePlatformStore";

export function PlatformDocumentTitle() {
  const platformName = usePlatformStore((s) => s.settings.platformName);

  useEffect(() => {
    document.title = `${platformName} - منصة إدارة المتاجر الإلكترونية`;
  }, [platformName]);

  return null;
}
