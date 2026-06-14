"use client";

import { useEffect, useState } from "react";

/**
 * يُرجع true بعد أول تركيب على المتصفح.
 * تحميل البيانات الفعلي يتم في DataProvider وتخطيطات admin/dashboard.
 */
export function useAppHydration() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
