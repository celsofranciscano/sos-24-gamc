import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { APP_NAME } from "@/constants/org";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingFooter } from "@/components/landing/footer";

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
  title: `${APP_NAME} · Emergencia 24/7 con IA`,
  description:
    "Sistema Inteligente de Coordinación y Respuesta a Emergencias para Cochabamba.",
};

export default function LandingLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <LandingNavbar />
        <main className="flex-1">{children}</main>
        <LandingFooter />
      </body>
    </html>
  );
}
