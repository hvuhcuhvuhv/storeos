import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { DataProvider } from "@/components/DataProvider";
import { PlatformDocumentTitle } from "@/components/PlatformDocumentTitle";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "زاهب - إدارة المتاجر الإلكترونية",
  description: "زاهب — المنصة المتكاملة لإدارة المتاجر الإلكترونية",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "زاهب",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-950 text-gray-100 antialiased">
        <DataProvider>
          <PlatformDocumentTitle />
          <ServiceWorkerRegister />
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
