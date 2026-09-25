"use client";

import { useEffect, useState } from "react";

import type { InventoryLotModel } from "@/mini-back/core/inventory-core/domain/models/inventory-lot.model";

import { inventoryLotOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-lot-orchestrator";
import LotForm from "./LotForm";

interface LotListProps {
  inventoryProductIdTemp: string;
  businessId: string;
}

export default function LotList({
  businessId,
  inventoryProductIdTemp,
}: LotListProps) {
  const [lots, setLots] = useState<InventoryLotModel[]>([]);

  const [editing, setEditing] = useState<InventoryLotModel | null>(null);

  const [creating, setCreating] = useState(false);

  async function load() {
    const result = await inventoryLotOrchestrator.findByProduct(
      inventoryProductIdTemp,
    );

    setLots(result);
  }

  useEffect(() => {
    load();
  }, [inventoryProductIdTemp]);

  if (creating || editing) {
    return (
      <LotForm
        businessId={businessId}
        inventoryProductIdTemp={inventoryProductIdTemp}
        lot={editing}
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
        <h3 className="font-semibold">Lotes</h3>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Nuevo lote
        </button>
      </div>

      <div className="rounded-lg border">
        {lots.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No hay lotes.</p>
        ) : (
          lots.map((lot) => (
            <div
              key={lot.idTemp}
              className="flex items-center justify-between border-b p-4 last:border-b-0"
            >
              <div>
                <p className="font-medium">{lot.lotNumber}</p>

                <p className="text-sm text-muted-foreground">
                  Vencimiento: {lot.expirationDate ?? "Sin vencimiento"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(lot)}
                className="text-sm hover:underline"
              >
                Editar
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
