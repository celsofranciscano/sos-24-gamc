import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { APP_FULL_NAME, APP_NAME } from "@/constants/org";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} · Ciudadano`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_FULL_NAME,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#dc2626",
};

export default function CitizenRootLayout({ children }: LayoutProps<"/citizen">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
