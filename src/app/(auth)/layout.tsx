import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Siren } from "lucide-react";

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
        <div className="flex min-h-dvh">
          {/* Left — Image panel */}
          <div className="relative hidden w-1/2 lg:flex lg:flex-col">
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-red-950/50" />

            {/* Content */}
            <div className="relative z-10 flex flex-1 flex-col justify-between p-10">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
                  <Siren className="size-5" />
                </span>
                <span className="text-xl font-bold tracking-tight text-white">
                  SOS<span className="text-red-400">-24</span>
                </span>
              </Link>

              {/* Tagline */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold leading-tight text-white lg:text-4xl">
                  Coordinación inteligente
                  <br />
                  de emergencias
                </h2>
                <p className="max-w-md text-base text-white/60">
                  Accede al panel de control para gestionar emergencias,
                  asignar recursos y coordinar la respuesta en tiempo real.
                </p>
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                    </span>
                    Sistema activo
                  </div>
                  <span className="text-sm text-white/30">24/7</span>
                </div>
              </div>

              {/* Footer */}
              <p className="text-xs text-white/30">
                © {new Date().getFullYear()} {APP_NAME}.{" "}
                Gobierno Autónomo Municipal de Cochabamba.
              </p>
            </div>
          </div>

          {/* Right — Form panel */}
          <div className="flex flex-1 flex-col bg-background">
            {/* Mobile header */}
            <div className="flex items-center justify-between p-4 lg:hidden">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white">
                  <Siren className="size-4" />
                </span>
                <span className="text-lg font-bold">
                  SOS<span className="text-red-500">-24</span>
                </span>
              </Link>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Volver al inicio
              </Link>
            </div>

            {/* Form area */}
            <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
              <div className="w-full max-w-sm">{children}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
