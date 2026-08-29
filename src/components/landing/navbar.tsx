"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, Siren, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Inicio", href: "#hero" },
  { label: "Características", href: "#features" },
  { label: "Cómo funciona", href: "#how-it-works" },
  { label: "Estadísticas", href: "#stats" },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-black/70 backdrop-blur-xl shadow-lg shadow-black/20"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
            <Siren className="size-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            SOS<span className="text-red-400">-24</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1.5 text-white/80 hover:text-white hover:bg-white/10",
            )}
          >
            Acceso institucional
          </Link>
          <Link
            href="/citizen/login"
            className={cn(
              buttonVariants({ size: "sm" }),
              "gap-1.5 bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-500",
            )}
          >
            <Siren className="size-3.5" />
            Ciudadano
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-white/80 transition-colors hover:text-white md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-black/90 backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-3 mt-2 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-full gap-1.5 border-white/20 text-white hover:bg-white/10",
                )}
              >
                Acceso institucional
              </Link>
              <Link
                href="/citizen/login"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "w-full gap-1.5 bg-red-600 text-white hover:bg-red-500",
                )}
              >
                <Siren className="size-3.5" />
                Ciudadano
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
