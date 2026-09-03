"use client";

import { useMemo, useState } from "react";

import {
  ArrowLeft,
  Check,
  Package,
  Search,
  X,
} from "lucide-react";

import type {
  AvailableMenuProduct,
  CreateOptionData,
} from "@/features/catalog/types/product-options";

interface SelectMenuProductsProps {
  menuProducts: AvailableMenuProduct[];

  onCreate: (
    options: CreateOptionData[],
  ) => void;

  onCancel: () => void;
}

interface SelectedProduct {
  product: AvailableMenuProduct;

  priceFinal: string;
}

export default function SelectMenuProducts({
  menuProducts,
  onCreate,
  onCancel,
}: SelectMenuProductsProps) {
  const [search, setSearch] =
    useState("");

  const [selectedProducts, setSelectedProducts] =
    useState<SelectedProduct[]>([]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      search.toLowerCase().trim();

    return menuProducts.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(normalizedSearch),
    );
  }, [menuProducts, search]);

  const getSelectedProduct = (
    productId: string,
  ) => {
    return selectedProducts.find(
      (item) =>
        item.product.id === productId,
    );
  };

  const isSelected = (
    productId: string,
  ) => {
    return !!getSelectedProduct(productId);
  };

  const toggleProduct = (
    product: AvailableMenuProduct,
  ) => {
    const exists = isSelected(product.id);

    if (exists) {
      setSelectedProducts((current) =>
        current.filter(
          (item) =>
            item.product.id !== product.id,
        ),
      );

      return;
    }

    setSelectedProducts((current) => [
      ...current,
      {
        product,
        priceFinal: "0",
      },
    ]);
  };

  const updatePrice = (
    productId: string,
    priceFinal: string,
  ) => {
    setSelectedProducts((current) =>
      current.map((item) => {
        if (
          item.product.id !== productId
        ) {
          return item;
        }

        return {
          ...item,
          priceFinal,
        };
      }),
    );
  };

  const handleSubmit = () => {
    if (!selectedProducts.length) {
      return;
    }

    const options: CreateOptionData[] =
      selectedProducts.map((item) => ({
        name: item.product.name,

        priceFinal:
          item.priceFinal || "0",

        hasStock:
          item.product.available,

        menuProductId:
          item.product.id,
      }));

    onCreate(options);
  };

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* HEADER */}

      <button
        type="button"
        onClick={onCancel}
        className="mb-4 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />

        Volver
      </button>

      <h4 className="font-semibold text-slate-900">
        Productos del menú
      </h4>

      <p className="mt-1 text-sm text-slate-500">
        Elegí los productos que serán opciones.
      </p>

      {/* BUSCADOR */}

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Buscar producto..."
          className="w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-blue-500"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* LISTA */}

      <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
        {filteredProducts.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <Package className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-2 text-sm text-slate-500">
              No se encontraron productos.
            </p>
          </div>
        )}

        {filteredProducts.map(
          (product) => {
            const selected =
              isSelected(product.id);

            const selectedData =
              getSelectedProduct(
                product.id,
              );

            return (
              <div
                key={product.id}
                className={`rounded-xl border transition ${
                  selected
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <label className="flex cursor-pointer items-center gap-3 p-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {selected && (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </div>

                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      toggleProduct(product)
                    }
                    className="sr-only"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {product.name}
                    </p>

                    <p className="text-xs text-slate-500">
                      Producto del menú
                    </p>
                  </div>
                </label>

                {/* PRECIO */}

                {selected && (
                  <div className="border-t border-blue-100 p-3">
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Precio adicional
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        selectedData?.priceFinal ??
                        "0"
                      }
                      onChange={(e) =>
                        updatePrice(
                          product.id,
                          e.target.value,
                        )
                      }
                      className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>

      {/* FOOTER */}

      <div className="mt-5 flex items-center justify-between border-t pt-4">
        <span className="text-sm text-slate-500">
          {selectedProducts.length} seleccionados
        </span>

        <button
          type="button"
          disabled={!selectedProducts.length}
          onClick={handleSubmit}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Agregar seleccionados
        </button>
      </div>
    </div>
  );
}