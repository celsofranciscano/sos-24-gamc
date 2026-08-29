import type { Metadata } from "next";
import Link from "next/link";
import {
  Ambulance,
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Radio,
  Shield,
  Siren,
  Users,
  Zap,
} from "lucide-react";

import { APP_FULL_NAME, APP_NAME, ORG_NAME } from "@/constants/org";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: `${APP_NAME} · Emergencia 24/7 con IA`,
  description: APP_FULL_NAME,
};

/* ──────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Bot,
    title: "IA de análisis en tiempo real",
    description:
      "Inteligencia artificial que clasifica emergencias, evalúa prioridades y recomienda acciones automáticamente.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
  },
  {
    icon: Radio,
    title: "Sala de crisis centralizada",
    description:
      "Canal abierto donde ciudadanos, GAMC, instituciones y unidades se comunican en tiempo real durante la emergencia.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80",
  },
  {
    icon: MapPin,
    title: "Rastreo GPS en vivo",
    description:
      "Seguimiento en tiempo real de cada unidad de respuesta mientras se desplaza hacia el lugar del incidente.",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80",
  },
  {
    icon: Users,
    title: "Deduplicación inteligente",
    description:
      "Múltiples reportes del mismo incidente se fusionan automáticamente. Una emergencia, no cinco alertas.",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&q=80",
  },
  {
    icon: Building2,
    title: "Coordinación multi-institución",
    description:
      "Policía, Bomberos, SAR y Ambulancias trabajan coordinadas desde un solo panel de control.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
  },
  {
    icon: Shield,
    title: "Control de acceso RBAC",
    description:
      "Cada usuario ve exactamente lo que le corresponde según su rol, institución y permisos.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80",
  },
];

const STEPS = [
  {
    number: "01",
    title: "El ciudadano reporta",
    description:
      "Presiona SOS en la app, comparte su ubicación y describe lo que sucede. La IA comienza a analizar.",
    icon: Phone,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
  },
  {
    number: "02",
    title: "La IA clasifica y deduplica",
    description:
      "Evalúa la emergencia, le asigna prioridad y verifica si ya existe un reporte similar para evitar duplicados.",
    icon: Bot,
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80",
  },
  {
    number: "03",
    title: "Se asignan recursos",
    description:
      "El GAMC asigna las instituciones y unidades adecuadas según el tipo de emergencia y los recursos disponibles.",
    icon: Building2,
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&q=80",
  },
  {
    number: "04",
    title: "Unidades se desplazan",
    description:
      "Las unidades salen hacia el sitio con rastreo GPS en vivo. El ciudadano ve la ubicación en tiempo real.",
    icon: Ambulance,
    image: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=600&q=80",
  },
  {
    number: "05",
    title: "Canal de crisis abierto",
    description:
      "Ciudadano, GAMC, instituciones y unidad se comunican en la sala de crisis hasta resolver la emergencia.",
    icon: Radio,
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80",
  },
  {
    number: "06",
    title: "Emergencia resuelta",
    description:
      "Se registra la resolución, se generan reportes y se actualizan las estadísticas del sistema.",
    icon: CheckCircle2,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
  },
];

const STATS = [
  { value: "< 30s", label: "Tiempo de respuesta IA", icon: Zap },
  { value: "24/7", label: "Operación continua", icon: Clock },
  { value: "98%", label: "Precisión de clasificación", icon: Bot },
  { value: "3+", label: "Instituciones coordinadas", icon: Building2 },
];

const INSTITUTIONS = [
  { name: "Policía Boliviana", code: "PB", color: "bg-blue-600" },
  { name: "Bomberos", code: "BOM", color: "bg-red-600" },
  { name: "SAR Bolivia", code: "SAR", color: "bg-emerald-600" },
  { name: "Ambulancias", code: "AMB", color: "bg-white text-red-600" },
];

/* ──────────────────────────────────────────────
   PAGE
   ────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ═══════════════════════════════════════ HERO */}
      <section id="hero" className="relative min-h-screen flex items-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80')",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        {/* Red accent glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-red-900/20 via-transparent to-orange-900/10" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm font-medium text-red-400 backdrop-blur-sm">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-red-500" />
              </span>
              Sistema activo 24/7 · Cochabamba
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
              Emergencias{" "}
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                24/7
              </span>
              <br />
              <span className="text-white/90">con inteligencia</span>
              <br />
              <span className="text-white/90">artificial</span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/60 sm:text-xl">
              {APP_FULL_NAME} para{" "}
              <span className="font-medium text-white/80">
                {ORG_NAME}
              </span>
              . Coordina la respuesta ante emergencias en tiempo real con IA,
              rastreo GPS y comunicación centralizada.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/citizen/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 bg-red-600 text-white shadow-2xl shadow-red-600/30 hover:bg-red-500 text-base",
                )}
              >
                <Siren className="size-5" />
                Reportar emergencia
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2 border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm text-base",
                )}
              >
                Acceso institucional
              </Link>
            </div>

            {/* Trust */}
            <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/50">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-400" />
                Código abierto
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-400" />
                Datos seguros
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-400" />
                Multi-institución
              </span>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ═══════════════════════════════════════ INSTITUTIONS BAR */}
      <section className="relative border-y border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8 uppercase tracking-widest">
            Coordinado con las principales instituciones de emergencia
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {INSTITUTIONS.map((inst) => (
              <div
                key={inst.code}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl text-xs font-bold text-white",
                    inst.color,
                  )}
                >
                  {inst.code}
                </span>
                <span className="text-sm font-semibold">{inst.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ FEATURES */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-red-500">
              Características
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Todo lo que necesitas para{" "}
              <span className="text-red-500">proteger</span> a tu comunidad
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Un sistema completo que integra inteligencia artificial,
              comunicación en tiempo real y gestión de recursos.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-2"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url('${feature.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex size-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                      <Icon className="size-6" />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ HOW IT WORKS — split layout */}
      <section id="how-it-works" className="relative">
        {/* Section header with background */}
        <div className="relative overflow-hidden py-20">
          <div
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-black/80" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <span className="text-sm font-semibold uppercase tracking-widest text-red-400">
              Cómo funciona
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              De reporte a resolución en{" "}
              <span className="text-red-400">6 pasos</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/60">
              Un flujo simple y poderoso que salva vidas.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-background">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isEven = i % 2 === 0;
            return (
              <div
                key={step.number}
                className={cn(
                  "grid items-center gap-0 lg:grid-cols-2",
                  i < STEPS.length - 1 && "border-b border-border",
                )}
              >
                {/* Image side */}
                <div
                  className={cn(
                    "relative h-72 overflow-hidden sm:h-80 lg:h-96",
                    !isEven && "lg:order-2",
                  )}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url('${step.image}')` }}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r to-transparent",
                      isEven
                        ? "from-background via-background/50"
                        : "to-background via-background/50 from-background",
                    )}
                  />
                  {/* Step number overlay */}
                  <div className="absolute top-6 left-6 text-7xl font-black text-white/10 sm:text-8xl">
                    {step.number}
                  </div>
                </div>

                {/* Content side */}
                <div
                  className={cn(
                    "flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16",
                    !isEven && "lg:order-1",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
                      <Icon className="size-7" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest text-red-500">
                      Paso {step.number}
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold sm:text-3xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════ STATS with background */}
      <section id="stats" className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-black/85" />
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-blue-900/20" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-red-400">
              Números que hablan
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Resultados que{" "}
              <span className="text-red-400">salvan vidas</span>
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1"
                >
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-600/20 text-red-400 transition-colors group-hover:bg-red-600/30">
                    <Icon className="size-7" />
                  </div>
                  <div className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {stat.value}
                  </div>
                  <p className="mt-2 text-sm text-white/50">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ CTA */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 via-red-800/85 to-orange-800/80" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-8 flex size-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
              <Siren className="size-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              ¿Necesitas ayuda ahora?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
              Presiona SOS y recibe ayuda inmediata. La inteligencia artificial
              clasifica y coordina la respuesta para que llegues a la ayuda más
              rápido.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/citizen/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 bg-white text-red-600 shadow-2xl shadow-black/20 hover:bg-white/90 text-base font-semibold",
                )}
              >
                <Siren className="size-5" />
                Reportar emergencia
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2 border-white/30 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm text-base",
                )}
              >
                Acceso institucional
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
