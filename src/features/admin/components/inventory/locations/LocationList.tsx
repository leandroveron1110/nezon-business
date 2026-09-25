"use client";

import { useEffect, useState } from "react";

import type { InventoryLocationModel } from "@/mini-back/core/inventory-core/domain/models/inventory-location.model";


import { inventoryLocationOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-location-orchestrator";
import LocationForm from "./LocationForm";

interface LocationListProps {
  businessId: string;
}

export default function LocationList({
  businessId,
}: LocationListProps) {
  const [locations, setLocations] =
    useState<InventoryLocationModel[]>([]);

  const [editing, setEditing] =
    useState<InventoryLocationModel | null>(null);

  const [creating, setCreating] = useState(false);

  async function load() {
    const result =
      await inventoryLocationOrchestrator.findAll(
        businessId,
      );

    setLocations(result);
  }

  useEffect(() => {
    load();
  }, [businessId]);

  if (creating || editing) {
    return (
      <LocationForm
        businessId={businessId}
        location={editing}
        onCancel={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={async () => {
          setCreating(false);
          setEditing(null);
          await load();
        }}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Ubicaciones
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Nueva ubicación
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Default</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {locations.map((location) => (
              <tr
                key={location.idTemp}
                className="border-b last:border-b-0"
              >
                <td className="px-4 py-3">
                  {location.code ?? "—"}
                </td>

                <td className="px-4 py-3 font-medium">
                  {location.name}
                </td>

                <td className="px-4 py-3">
                  {location.isDefault ? "Sí" : "No"}
                </td>

                <td className="px-4 py-3">
                  {location.isActive ? "Activa" : "Inactiva"}
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(location)}
                    className="hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}