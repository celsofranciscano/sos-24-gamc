"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Navigation,
  Truck,
  Clock,
  MapPin,
  Loader2,
} from "lucide-react";

import { CitizenMap } from "@/components/citizen/citizen-map";

type TrackingData = {
  emergencyCode: string;
  location: { latitude: number; longitude: number; address: string | null } | null;
  assignments: Array<{
    unitCode: string;
    unitName: string;
    institutionName: string;
    status: string;
    tracking: {
      latitude: number;
      longitude: number;
      speed: number | null;
      heading: number | null;
      createdAt: string;
    } | null;
  }>;
};

export default function EmergencyTrackingPage() {
  const params = useParams();
  const emergencyCode = params.emergencyCode as string;
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTracking = useCallback(async () => {
    try {
      // Get emergency ID first
      const listRes = await fetch("/api/citizen/emergencies");
      const listData = await listRes.json();
      const emergency = (listData.emergencies || []).find(
        (e: { emergencyCode: string }) => e.emergencyCode === emergencyCode,
      );

      if (!emergency) {
        setLoading(false);
        return;
      }

      const detailRes = await fetch(
        `/api/citizen/emergencies/${emergency.PK_emergency}`,
      );
      const detailData = await detailRes.json();
      const detail = detailData.emergency;

      if (detail) {
        setData({
          emergencyCode: detail.emergencyCode,
          location: detail.tbemergencylocations?.[0] || null,
          assignments: (detail.tbemergencyassignments || []).map(
            (a: {
              tbunits: { unitCode: string; unitName: string } | null;
              tbinstitutions: { name: string };
              status: string;
            }) => ({
              unitCode: a.tbunits?.unitCode || "N/A",
              unitName: a.tbunits?.unitName || a.tbinstitutions.name,
              institutionName: a.tbinstitutions.name,
              status: a.status,
              tracking: null, // Would need separate tracking API
            }),
          ),
        });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [emergencyCode]);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 10000);
    return () => clearInterval(interval);
  }, [fetchTracking]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Link
          href={`/citizen/emergency/${emergencyCode}`}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-base font-semibold">Seguimiento GPS</h1>
          <p className="text-xs text-muted-foreground font-mono">
            {emergencyCode}
          </p>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <CitizenMap
          center={data?.location || undefined}
          markers={[
            ...(data?.location
              ? [{
                  id: "emergency-location",
                  latitude: data.location.latitude,
                  longitude: data.location.longitude,
                  label: "Emergencia",
                  color: "red",
                }]
              : []),
            ...(data?.assignments
              .filter((a) => a.tracking)
              .map((a) => ({
                id: a.unitCode,
                latitude: a.tracking!.latitude,
                longitude: a.tracking!.longitude,
                label: a.unitCode,
                color: "blue",
              })) || []),
          ]}
          showMyLocation
          className="h-full"
        />
      </div>

      {/* Unit info */}
      {data && data.assignments.length > 0 && (
        <div className="border-t bg-background p-4 space-y-2">
          {data.assignments.map((unit) => (
            <div
              key={unit.unitCode}
              className="flex items-center gap-3 rounded-xl border bg-card p-3"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                <Truck className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{unit.unitName}</p>
                <p className="text-xs text-muted-foreground">
                  {unit.institutionName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">{unit.status}</p>
                {unit.tracking && (
                  <p className="text-[10px] text-muted-foreground">
                    {unit.tracking.speed
                      ? `${Math.round(unit.tracking.speed)} km/h`
                      : "En sitio"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
