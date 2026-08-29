"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

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
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [myLocation, setMyLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Get user's current location
  useEffect(() => {
    if (!showMyLocation) {
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setMapError("Geolocalización no soportada.");
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
        console.error("Geolocation error:", err);
        // Default to Cochabamba
        const defaultCoords = {
          latitude: -17.4139,
          longitude: -66.1653,
        };
        setMyLocation(defaultCoords);
        onLocationChange?.(defaultCoords);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [showMyLocation, onLocationChange]);

  const effectiveCenter = center || myLocation || { latitude: -17.4139, longitude: -66.1653 };

  // Build Google Maps URL with markers
  const buildMapUrl = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const allMarkers = [...markers];

    if (showMyLocation && myLocation) {
      allMarkers.unshift({
        id: "my-location",
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        label: "Tú",
        color: "red",
      });
    }

    if (apiKey) {
      // Use Google Maps Static API
      const markerStr = allMarkers
        .map(
          (m) =>
            `markers=color:${m.color || "red"}%7Clabel:${encodeURIComponent(m.label || "")}%7C${m.latitude},${m.longitude}`,
        )
        .join("&");

      return `https://maps.googleapis.com/maps/api/staticmap?center=${effectiveCenter.latitude},${effectiveCenter.longitude}&zoom=14&size=600x400&maptype=roadmap&${markerStr}&key=${apiKey}`;
    }

    // Fallback: OpenStreetMap embed
    return `https://www.openstreetmap.org/export/embed.html?bbox=${effectiveCenter.longitude - 0.02},${effectiveCenter.latitude - 0.015},${effectiveCenter.longitude + 0.02},${effectiveCenter.latitude + 0.015}&layer=mapnik&marker=${effectiveCenter.latitude},${effectiveCenter.longitude}`;
  }, [markers, showMyLocation, myLocation, effectiveCenter]);

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
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm">Obteniendo ubicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)} style={{ height }}>
      {mapError ? (
        <div className="flex h-full items-center justify-center bg-muted/50">
          <div className="text-center text-muted-foreground">
            <MapPin className="mx-auto size-8 opacity-30" />
            <p className="mt-1 text-sm">{mapError}</p>
          </div>
        </div>
      ) : (
        <>
          <iframe
            src={buildMapUrl()}
            className="h-full w-full border-0"
            loading="lazy"
            title="Mapa"
          />
          {/* My location button */}
          {showMyLocation && myLocation && (
            <button
              onClick={() => {
                if (mapRef.current) {
                  const iframe = mapRef.current.querySelector("iframe");
                  if (iframe) {
                    iframe.src = buildMapUrl();
                  }
                }
              }}
              className="absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full bg-white shadow-lg border border-border"
            >
              <Navigation className="size-4 text-foreground" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
