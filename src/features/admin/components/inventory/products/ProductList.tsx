"use client";

import { useEffect, useState } from "react";

import type { InventoryProductModel } from "@/mini-back/core/inventory-core/domain/models/inventory-product.model";

import ProductTable from "./ProductTable";
import ProductForm from "./ProductForm";
import { inventoryProductOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-product-orchestrator";
import ProductDetail from "./ProductDetail";

interface ProductListProps {
  businessId: string;
}

export default function ProductList({
  businessId,
}: ProductListProps) {
  const [products, setProducts] = useState<InventoryProductModel[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingProduct, setEditingProduct] =
    useState<InventoryProductModel | null>(null);

  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProductModel | null>(null);

  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);

    try {
      const result =
        await inventoryProductOrchestrator.findByBusinessId(
          businessId,
        );

      setProducts(result);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [businessId]);

  if (selectedProduct) {
    return (
      <ProductDetail
        businessId={businessId}
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onEdit={() => {
          setEditingProduct(selectedProduct);
          setSelectedProduct(null);
          setShowForm(true);
        }}
      />
    );
  }

  if (showForm) {
    return (
      <ProductForm
        businessId={businessId}
        product={editingProduct}
        onCancel={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        onSaved={async () => {
          setShowForm(false);
          setEditingProduct(null);
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
            Productos
          </h2>

          <p className="text-sm text-muted-foreground">
            Productos administrados por inventario.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Nuevo producto
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border p-8 text-center">
          Cargando productos...
        </div>
      ) : (
        <ProductTable
          products={products}
          onSelect={setSelectedProduct}
          onEdit={(product) => {
            setEditingProduct(product);
            setShowForm(true);
          }}
        />
      )}
    </section>
  );
}