"use client";

import { useEffect, useState } from "react";

import type { InventoryPresentationModel } from "@/mini-back/core/inventory-core/domain/models/inventory-presentation.model";

import { inventoryPresentationOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-presentation-orchestrator";
import PresentationForm from "./PresentationForm";

interface PresentationListProps {
  inventoryProductIdTemp: string;
  businessId: string;
}

export default function PresentationList({
  inventoryProductIdTemp,
  businessId,
}: PresentationListProps) {
  const [presentations, setPresentations] = useState<
    InventoryPresentationModel[]
  >([]);

  const [editing, setEditing] = useState<InventoryPresentationModel | null>(
    null,
  );

  const [creating, setCreating] = useState(false);

  async function load() {
    const result = await inventoryPresentationOrchestrator.findByProduct(
      inventoryProductIdTemp,
    );

    setPresentations(result);
  }

  useEffect(() => {
    load();
  }, [inventoryProductIdTemp]);

  if (creating || editing) {
    return (
      <PresentationForm
        businessId={businessId}
        inventoryProductIdTemp={inventoryProductIdTemp}
        presentation={editing}
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
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Presentaciones</h3>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Nueva
        </button>
      </div>

      <div className="rounded-lg border">
        {presentations.map((presentation) => (
          <div
            key={presentation.idTemp}
            className="flex items-center justify-between border-b p-4 last:border-b-0"
          >
            <div>
              <p className="font-medium">{presentation.name}</p>

              <p className="text-sm text-muted-foreground">
                × {presentation.conversionFactor}
                {presentation.barcode ? ` · ${presentation.barcode}` : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditing(presentation)}
              className="text-sm hover:underline"
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
