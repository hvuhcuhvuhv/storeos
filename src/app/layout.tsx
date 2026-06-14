import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { StoreHydration } from "@/components/StoreHydration";
import { PlatformDocumentTitle } from "@/components/PlatformDocumentTitle";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StoreOS - منصة إدارة المتاجر الإلكترونية",
  description: "منصة متكاملة لإدارة المتاجر الإلكترونية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-950 text-gray-100 antialiased">
        <StoreHydration />
        <PlatformDocumentTitle />
        {children}
      </body>
    </html>
  );
}
