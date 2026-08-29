"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  FileText,
  Info,
  LogOut,
  Phone,
  Shield,
  Smartphone,
  User,
  Loader2,
} from "lucide-react";

import { signOutAction } from "@/lib/auth/actions";

type Profile = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string | null;
  CI: string | null;
  createdAt: string;
};

const SETTINGS_ITEMS = [
  {
    label: "Mi perfil",
    href: "/citizen/account/profile",
    icon: User,
    description: "Nombre, teléfono, correo",
  },
  {
    label: "Notificaciones",
    href: "/citizen/account/notifications",
    icon: Bell,
    description: "Gestiona tus alertas",
  },
  {
    label: "Dispositivos",
    href: "/citizen/account/devices",
    icon: Smartphone,
    description: "Dispositivos registrados",
  },
  {
    label: "Privacidad y seguridad",
    href: "/citizen/account/privacy",
    icon: Shield,
    description: "Contraseña y datos",
  },
  {
    label: "Acerca de",
    href: "/citizen/account/about",
    icon: Info,
    description: "SOS-24 v1.0",
  },
];

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/citizen/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.citizen) setProfile(data.citizen);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-full flex-col">
      <section className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-semibold">Mi cuenta</h1>
      </section>

      <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-4">
        {/* Profile card */}
        <div className="rounded-2xl border bg-card p-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : profile ? (
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 text-lg font-bold">
                {profile.firstName[0]}
                {profile.lastName[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile.phoneNumber}
                </p>
                {profile.email && (
                  <p className="text-xs text-muted-foreground">
                    {profile.email}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Settings */}
        <div className="space-y-1">
          {SETTINGS_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <item.icon className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl p-3 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <LogOut className="size-5" />
            </div>
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </form>
      </div>
    </div>
  );
}
