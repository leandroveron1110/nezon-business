// src/components/MapClientWrapper.tsx
"use client";

import dynamic from "next/dynamic";
import { AddressData } from "../types/address-data";

const MapComponent = dynamic(() => import("./Map/LocationSelector"), {
  ssr: false,
});

interface MapClientWrapperProps {
  onSave: (data: AddressData) => void;
}

export default function MapClientWrapper({ onSave }: MapClientWrapperProps) {
  return (
    <div className="h-full w-full">
      <MapComponent onSave={onSave} />
    </div>
  );
}