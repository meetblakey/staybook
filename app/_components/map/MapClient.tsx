"use client";

import dynamic from "next/dynamic";
import type { MapProps } from "./MapInner";

const MapInner = dynamic(() => import("./MapInner"), { ssr: false, loading: () => <div className="h-full w-full rounded-3xl bg-gray-100" /> });

export function MapClient(props: MapProps) {
  return <MapInner {...props} />;
}
