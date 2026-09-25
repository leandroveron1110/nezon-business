"use client";

import { useEffect, useState } from "react";

import type { InventoryProductModel } from "@/mini-back/core/inventory-core/domain/models/inventory-product.model";
import type { InventoryBaseUnitModel } from "@/mini-back/core/inventory-core/domain/models/inventory-base-unit.model";

import type {
  CreateProductInput,
  UpdateProductInput,
} from "@/mini-back/core/inventory-core/public";
import { inventoryBaseUnitOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-base-unit-orchestrator";
import { inventoryProductOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-product-orchestrator";

interface ProductFormProps {
  businessId: string;
  product: InventoryProductModel | null;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}

export default function ProductForm({
  businessId,
  product,
  onCancel,
  onSaved,
}: ProductFormProps) {
  const editing = !!product;

  const [units, setUnits] = useState<InventoryBaseUnitModel[]>([]);

  const [name, setName] = useState(product?.name ?? "");
  const [code, setCode] = useState(product?.code ?? "");
  const [description, setDescription] = useState(product?.description ?? "");

  const [baseUnitIdTemp, setBaseUnitIdTemp] = useState(
    product?.baseUnitIdTemp ?? "",
  );

  const [minStock, setMinStock] = useState(product?.minStock?.toString() ?? "");

  const [maxStock, setMaxStock] = useState(product?.maxStock?.toString() ?? "");

  const [trackLots, setTrackLots] = useState(product?.trackLots ?? false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    inventoryBaseUnitOrchestrator.findAll().then(setUnits);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      if (product) {
        const input: UpdateProductInput = {
          businessId,
          idTemp: product.idTemp,
          name,
          code: code || null,
          description: description || null,
          baseUnitIdTemp,
          minStock: minStock === "" ? null : Number(minStock),
          maxStock: maxStock === "" ? null : Number(maxStock),
          trackLots,
        };

        await inventoryProductOrchestrator.update(input);
      } else {
        const input: CreateProductInput = {
          idTemp: crypto.randomUUID(),
          businessId,
          name,
          code: code || null,
          description: description || null,
          baseUnitIdTemp,
          minStock: minStock === "" ? null : Number(minStock),
          maxStock: maxStock === "" ? null : Number(maxStock),
          trackLots,
        };

        await inventoryProductOrchestrator.create(input);
      }

      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">
          {editing ? "Editar producto" : "Nuevo producto"}
        </h2>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-lg border p-6">
        <div>
          <label className="text-sm font-medium">Nombre</label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Código</label>

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-2 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Unidad base</label>

          <select
            value={baseUnitIdTemp}
            onChange={(e) => setBaseUnitIdTemp(e.target.value)}
            required
            className="mt-2 w-full rounded-md border px-3 py-2"
          >
            <option value="">Seleccionar unidad</option>

            {units.map((unit) => (
              <option key={unit.idTemp} value={unit.idTemp}>
                {unit.code} — {unit.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Descripción</label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 min-h-24 w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Stock mínimo</label>

            <input
              type="number"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="mt-2 w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Stock máximo</label>

            <input
              type="number"
              min="0"
              value={maxStock}
              onChange={(e) => setMaxStock(e.target.value)}
              className="mt-2 w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>

        <label className="flex gap-3">
          <input
            type="checkbox"
            checked={trackLots}
            onChange={(e) => setTrackLots(e.target.checked)}
          />

          <span className="text-sm">Maneja lotes y vencimientos</span>
        </label>

        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
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
