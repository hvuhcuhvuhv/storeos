"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlatformStore } from "@/store/usePlatformStore";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const loadSettings = usePlatformStore((s) => s.loadSettings);

  useEffect(() => {
    fetchMe();
    loadSettings();
  }, [fetchMe, loadSettings]);

  return <>{children}</>;
}
