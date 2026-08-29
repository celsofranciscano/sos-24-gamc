import Link from "next/link";
import { Siren } from "lucide-react";
import { APP_NAME, ORG_NAME } from "@/constants/org";

const FOOTER_LINKS = {
  "Acceso rápido": [
    { label: "Soy ciudadano", href: "/citizen/login" },
    { label: "Acceso institucional", href: "/login" },
    { label: "Números de emergencia", href: "/citizen/emergency-numbers" },
  ],
  Sistema: [
    { label: "Cómo funciona", href: "#how-it-works" },
    { label: "Características", href: "#features" },
    { label: "Estadísticas", href: "#stats" },
  ],
  Legal: [
    { label: "Privacidad", href: "#" },
    { label: "Términos de uso", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-black">
      {/* Subtle pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
                <Siren className="size-5" />
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                SOS<span className="text-red-400">-24</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/50">
              {APP_NAME} es el Sistema Inteligente de Coordinación y Respuesta
              a Emergencias del {ORG_NAME}. Protege a nuestra comunidad con
              tecnología de inteligencia artificial.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/40">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-green-500" />
              </span>
              Sistema operativo 24/7
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <h4 className="text-sm font-semibold tracking-tight text-white">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-white/80"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} {APP_NAME}. Todos los derechos
            reservados.
          </p>
          <p className="text-xs text-white/30">{ORG_NAME}</p>
        </div>
      </div>
    </footer>
  );
}
