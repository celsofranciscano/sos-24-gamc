"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";

import { CitizenMap } from "@/components/citizen/citizen-map";

type Institution = {
  PK_institution: number;
  name: string;
  acronym: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  tbinstitutiontypes: { name: string; code: string };
};

export default function InstitutionDetailPage() {
  const params = useParams();
  const institutionId = params.institutionId as string;
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/citizen/emergency-numbers")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.institutions || []).find(
          (i: Institution) =>
            i.PK_institution === Number(institutionId),
        );
        setInstitution(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [institutionId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <Building2 className="size-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Institución no encontrada</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link
          href="/citizen/emergency-numbers"
          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-base font-semibold">{institution.name}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Map */}
        {institution.latitude && institution.longitude && (
          <CitizenMap
            center={{
              latitude: institution.latitude,
              longitude: institution.longitude,
            }}
            markers={[
              {
                id: "institution",
                latitude: institution.latitude,
                longitude: institution.longitude,
                label: institution.acronym || institution.name.slice(0, 2),
                color: "blue",
              },
            ]}
            showMyLocation
            height="180px"
          />
        )}

        {/* Info */}
        <div className="space-y-3">
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="text-sm font-medium">
                  {institution.tbinstitutiontypes.name}
                </p>
              </div>
            </div>

            {institution.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <a
                    href={`tel:${institution.phoneNumber}`}
                    className="text-sm font-medium text-red-500"
                  >
                    {institution.phoneNumber}
                  </a>
                </div>
              </div>
            )}

            {institution.email && (
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Correo</p>
                  <a
                    href={`mailto:${institution.email}`}
                    className="text-sm font-medium text-red-500"
                  >
                    {institution.email}
                  </a>
                </div>
              </div>
            )}

            {institution.address && (
              <div className="flex items-center gap-3">
                <MapPin className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Dirección</p>
                  <p className="text-sm font-medium">{institution.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Call button */}
          {institution.phoneNumber && (
            <a
              href={`tel:${institution.phoneNumber}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 hover:bg-green-500"
            >
              <Phone className="size-4" />
              Llamar ahora
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
