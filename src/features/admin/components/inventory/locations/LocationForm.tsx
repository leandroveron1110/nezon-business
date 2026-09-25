"use client";

import { useState } from "react";

import type { InventoryLocationModel } from "@/mini-back/core/inventory-core/domain/models/inventory-location.model";

import type {
  CreateLocationInput,
  UpdateLocationInput,
} from "@/mini-back/core/inventory-core/public";
import { inventoryLocationOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-location-orchestrator";


interface LocationFormProps {
  businessId: string;
  location: InventoryLocationModel | null;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}

export default function LocationForm({
  businessId,
  location,
  onCancel,
  onSaved,
}: LocationFormProps) {
  const [name, setName] = useState(location?.name ?? "");
  const [code, setCode] = useState(location?.code ?? "");
  const [description, setDescription] =
    useState(location?.description ?? "");
  const [isDefault, setIsDefault] =
    useState(location?.isDefault ?? false);

  const [saving, setSaving] = useState(false);

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSaving(true);

    try {
      if (location) {
        const input: UpdateLocationInput = {
          idTemp: location.idTemp,
          name,
          code: code || null,
          description: description || null,
          businessId
        };

        await inventoryLocationOrchestrator.update(input);
      } else {
        const input: CreateLocationInput = {
          businessId,
          name,
          code: code || null,
          description: description || null,
          isDefault,
          idTemp: crypto.randomUUID()
        };

        await inventoryLocationOrchestrator.create(input);
      }

      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-xl space-y-6">
      <h2 className="text-lg font-semibold">
        {location ? "Editar ubicación" : "Nueva ubicación"}
      </h2>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-lg border p-6"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código"
          className="w-full rounded-md border px-3 py-2"
        />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          required
          className="w-full rounded-md border px-3 py-2"
        />

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          placeholder="Descripción"
          className="w-full rounded-md border px-3 py-2"
        />

        <label className="flex gap-3">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) =>
              setIsDefault(e.target.checked)
            }
          />

          <span>Ubicación predeterminada</span>
        </label>

        <div className="flex justify-end gap-3">
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