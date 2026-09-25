"use client";

import { useEffect, useState } from "react";

import type { InventoryBaseUnitModel } from "@/mini-back/core/inventory-core/domain/models/inventory-base-unit.model";

import BaseUnitForm from "./BaseUnitForm";
import { inventoryBaseUnitOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-base-unit-orchestrator";

export default function BaseUnitList() {
  const [units, setUnits] = useState<InventoryBaseUnitModel[]>([]);

  const [editing, setEditing] =
    useState<InventoryBaseUnitModel | null>(null);

  const [creating, setCreating] = useState(false);

  async function load() {
    const result =
      await inventoryBaseUnitOrchestrator.findAll();

    setUnits(result);
  }

  useEffect(() => {
    load();
  }, []);

  if (creating || editing) {
    return (
      <BaseUnitForm
        unit={editing}
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
            Unidades base
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Nueva unidad
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left">
                Código
              </th>

              <th className="px-4 py-3 text-left">
                Nombre
              </th>

              <th className="px-4 py-3 text-right">
                Acción
              </th>
            </tr>
          </thead>

          <tbody>
            {units.map((unit) => (
              <tr
                key={unit.idTemp}
                className="border-b last:border-b-0"
              >
                <td className="px-4 py-3">
                  {unit.code}
                </td>

                <td className="px-4 py-3">
                  {unit.name}
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(unit)}
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