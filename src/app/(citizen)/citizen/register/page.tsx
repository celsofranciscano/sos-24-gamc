import type { Metadata } from "next";
import { CitizenRegisterForm } from "@/components/auth/citizen-register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function CitizenRegisterPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center py-12">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-tr from-red-950/30 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm px-4">
        <CitizenRegisterForm />
      </div>
    </div>
  );
}
