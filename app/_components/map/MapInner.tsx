"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useRouter } from "next/navigation";
import type { Icon, LatLngExpression } from "leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

export type MapMarker = {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  subtitle?: string;
};

export type MapProps = {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
};

const createDefaultIcon = (): Icon =>
  L.icon({
    iconUrl: "/leaflet/marker-icon.png",
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    shadowUrl: "/leaflet/marker-shadow.png",
    iconAnchor: [12, 41],
    iconSize: [25, 41],
    shadowAnchor: [12, 41],
  });

export default function MapInner({ markers, center, zoom = 12 }: MapProps) {
  const router = useRouter();
  const mapCenter: LatLngExpression = useMemo(() => {
    if (center) {
      return [center.lat, center.lng];
    }

    if (markers.length > 0) {
      const [first] = markers;
      return [first.position.lat, first.position.lng];
    }

    return [40.7128, -74.006];
  }, [center, markers]);

  const icon = useMemo(() => createDefaultIcon(), []);
  const tilesUrl = process.env.NEXT_PUBLIC_MAP_TILES_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full rounded-3xl"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors' url={tilesUrl} />
      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.position.lat, marker.position.lng]} icon={icon} eventHandlers={{
          click: () => router.push(`/listing/${marker.id}`),
        }}>
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">{marker.title}</p>
              {marker.subtitle ? <p className="text-xs text-gray-500">{marker.subtitle}</p> : null}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
