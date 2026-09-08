"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import { GoogleMap, type MapMarker } from "@/components/maps/google-map";
import { cn } from "@/lib/utils";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type CitizenMapProps = {
  center?: Coordinates;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    label?: string;
    color?: string;
  }>;
  onLocationChange?: (coords: Coordinates) => void;
  showMyLocation?: boolean;
  className?: string;
  height?: string;
};

export function CitizenMap({
  center,
  markers = [],
  onLocationChange,
  showMyLocation = true,
  className,
  height = "100%",
}: CitizenMapProps) {
  const [myLocation, setMyLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Get user's current GPS location
  useEffect(() => {
    if (!showMyLocation) {
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setMapError("Geolocalización no soportada en este navegador.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setMyLocation(coords);
        onLocationChange?.(coords);
        setLoading(false);
      },
      (err) => {
        console.warn("Geolocation warning:", err.message);
        // Default to Cochabamba centro
        const defaultCoords = {
          latitude: -17.3895,
          longitude: -66.1568,
        };
        setMyLocation(defaultCoords);
        onLocationChange?.(defaultCoords);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [showMyLocation, onLocationChange]);

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/50 rounded-2xl",
          className,
        )}
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <p className="text-sm">Localizando ubicación GPS...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/50 rounded-2xl p-4",
          className,
        )}
        style={{ height }}
      >
        <div className="text-center text-muted-foreground">
          <MapPin className="mx-auto size-8 opacity-30 text-destructive" />
          <p className="mt-1 text-sm">{mapError}</p>
        </div>
      </div>
    );
  }

  const resolvedCenter = center
    ? { lat: center.latitude, lng: center.longitude }
    : myLocation
    ? { lat: myLocation.latitude, lng: myLocation.longitude }
    : { lat: -17.3895, lng: -66.1568 };

  const mapMarkers: MapMarker[] = markers.map((m) => ({
    id: m.id,
    lat: m.latitude,
    lng: m.longitude,
    title: m.label,
    color: m.color ?? "#dc2626",
  }));

  if (showMyLocation && myLocation && !markers.some((m) => m.id === "me" || m.id === "my-location")) {
    mapMarkers.unshift({
      id: "my-location",
      lat: myLocation.latitude,
      lng: myLocation.longitude,
      title: "Tu ubicación",
      color: "#2563eb",
    });
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl w-full", className)} style={{ height }}>
      <GoogleMap
        center={resolvedCenter}
        markers={mapMarkers}
        zoom={15}
        className="h-full w-full rounded-2xl border-0"
      />
    </div>
  );
}
