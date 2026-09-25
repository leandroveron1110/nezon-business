"use client";

import { useState } from "react";

import type { InventoryBaseUnitModel } from "@/mini-back/core/inventory-core/domain/models/inventory-base-unit.model";

import type {
  CreateBaseUnitInput,
  UpdateBaseUnitInput,
} from "@/mini-back/core/inventory-core/public";
import { inventoryBaseUnitOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-base-unit-orchestrator";


interface BaseUnitFormProps {
  unit: InventoryBaseUnitModel | null;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}

export default function BaseUnitForm({
  unit,
  onCancel,
  onSaved,
}: BaseUnitFormProps) {
  const [code, setCode] = useState(unit?.code ?? "");
  const [name, setName] = useState(unit?.name ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSaving(true);

    try {
      if (unit) {
        const input: UpdateBaseUnitInput = {
          idTemp: unit.idTemp,
          code,
          name,
        };

        await inventoryBaseUnitOrchestrator.update(input);
      } else {
        const input: CreateBaseUnitInput = {
          code,
          name,
          idTemp: crypto.randomUUID()
        };

        await inventoryBaseUnitOrchestrator.create(input);
      }

      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-xl space-y-6">
      <h2 className="text-lg font-semibold">
        {unit ? "Editar unidad" : "Nueva unidad"}
      </h2>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-lg border p-6"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código"
          required
          className="w-full rounded-md border px-3 py-2"
        />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          required
          className="w-full rounded-md border px-3 py-2"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </section>
  );
}