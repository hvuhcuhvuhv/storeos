import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "منصة سند — متجرك الإلكتروني",
    short_name: "سند",
    description: "منصة سند لإدارة المتاجر الإلكترونية — تسوّق وأدر متجرك من هاتفك",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#030712",
    theme_color: "#030712",
    dir: "rtl",
    lang: "ar",
    categories: ["shopping", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
