"use client";

import { APIProvider, Map as GoogleMapsView, Marker, Polyline } from "@vis.gl/react-google-maps";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MapMarker = {
  id: string | number;
  lat: number;
  lng: number;
  color?: string;
  label?: string;
  title?: string;
};

export type MapPath = {
  id: string | number;
  points: { lat: number; lng: number }[];
  color?: string;
};

export const COCHABAMBA_CENTER = { lat: -17.3895, lng: -66.1568 };
export const COCHABAMBA_BOUNDS = {
  north: -17.30,
  south: -17.48,
  west: -66.30,
  east: -66.05,
};

function pinIcon(color: string): google.maps.Symbol {
  return {
    path: "M -1.5 0 C -1.5 -2.2 0.6 -4 3 -4 C 5.4 -4 7.5 -2.2 7.5 0 C 7.5 2.8 3 7 3 7 C 3 7 -1.5 2.8 -1.5 0 Z M 3 -2 m -1.6 0 a 1.6 1.6 0 1 0 3.2 0 a 1.6 1.6 0 1 0 -3.2 0",
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 1.5,
    scale: 2.2,
  };
}

function MapFallback({ markers }: { markers: MapMarker[] }) {
  return (
    <Card className="h-full w-full border-dashed">
      <CardContent className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-sm font-medium">Mapa no disponible</p>
        <p className="max-w-md text-xs text-muted-foreground">
          Configura la variable de entorno{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          con una clave de Google Maps JavaScript API para visualizar el mapa operativo.
        </p>
        {markers.length > 0 && (
          <div className="mt-2 w-full max-w-xs overflow-hidden rounded-lg border text-left text-[11px]">
            {markers.slice(0, 6).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-2 border-b px-2 py-1 last:border-b-0"
              >
                <span className="truncate">{m.title ?? `Marcador ${m.id}`}</span>
                <span className="font-mono text-muted-foreground">
                  {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                </span>
              </div>
            ))}
            {markers.length > 6 && (
              <div className="px-2 py-1 text-muted-foreground">
                +{markers.length - 6} ubicaciones más
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GoogleMap({
  markers = [],
  paths = [],
  center,
  zoom = 12,
  className,
}: {
  markers?: MapMarker[];
  paths?: MapPath[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return <MapFallback markers={markers} />;

  const resolvedCenter =
    center ??
    (markers.length > 0 ? { lat: markers[0].lat, lng: markers[0].lng } : COCHABAMBA_CENTER);

  return (
    <div className={cn("overflow-hidden rounded-xl border", className)}>
      <APIProvider apiKey={apiKey}>
        <GoogleMapsView
          className="h-full w-full"
          defaultCenter={resolvedCenter}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
          restriction={{
            latLngBounds: COCHABAMBA_BOUNDS,
            strictBounds: false,
          }}
        >
          {paths.map((path) => (
            <Polyline
              key={path.id}
              path={path.points.map((p) => ({ lat: p.lat, lng: p.lng }))}
              strokeColor={path.color ?? "#2563eb"}
              strokeOpacity={0.9}
              strokeWeight={3}
            />
          ))}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.title}
              icon={pinIcon(marker.color ?? "#dc2626")}
            />
          ))}
        </GoogleMapsView>
      </APIProvider>
    </div>
  );
}
