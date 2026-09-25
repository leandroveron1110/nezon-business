"use client";

import type { InventoryProductModel } from "@/mini-back/core/inventory-core/domain/models/inventory-product.model";

import PresentationList from "../presentations/PresentationList";
import LotList from "../lots/LotList";

interface ProductDetailProps {
  businessId: string;
  product: InventoryProductModel;
  onBack: () => void;
  onEdit: () => void;
}

export default function ProductDetail({
  businessId,
  product,
  onBack,
  onEdit,
}: ProductDetailProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-2 text-sm text-muted-foreground hover:underline"
          >
            ← Volver
          </button>

          <h2 className="text-xl font-semibold">
            {product.name}
          </h2>

          <p className="text-sm text-muted-foreground">
            {product.code ?? "Sin código"}
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Editar
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Stock mínimo
          </p>

          <p className="mt-1 text-lg font-semibold">
            {product.minStock ?? "—"}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Stock máximo
          </p>

          <p className="mt-1 text-lg font-semibold">
            {product.maxStock ?? "—"}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Lotes
          </p>

          <p className="mt-1 text-lg font-semibold">
            {product.trackLots ? "Sí" : "No"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold">
            Presentaciones
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Definí las formas físicas en las que se ingresa o maneja este producto.
          </p>
        </div>

        <PresentationList
          businessId={businessId}
          inventoryProductIdTemp={product.idTemp}
        />
      </div>

      {product.trackLots && (
        <div className="rounded-lg border p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold">
              Lotes
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Administrá los lotes y vencimientos de este producto.
            </p>
          </div>

          <LotList
            businessId={businessId}
            inventoryProductIdTemp={product.idTemp}
          />
        </div>
      )}
    </section>
  );
}