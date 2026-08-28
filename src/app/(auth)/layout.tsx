import type { Metadata } from "next";
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
  title: `${APP_NAME} · Acceso institucional`,
  description: APP_FULL_NAME,
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">
        <div className="flex min-h-dvh items-center justify-center p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
