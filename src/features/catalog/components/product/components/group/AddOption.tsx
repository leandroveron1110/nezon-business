"use client";

import { useState } from "react";

import {
  PackagePlus,
  Plus,
  X,
} from "lucide-react";

import CreateCustomOption from "./CreateCustomOption";
import SelectMenuProducts from "./SelectMenuProducts";

import type {
  AvailableMenuProduct,
  CreateOptionData,
} from "@/features/catalog/types/product-options";

type AddOptionMode =
  | "MENU"
  | "CUSTOM"
  | null;

interface AddOptionProps {
  menuProducts: AvailableMenuProduct[];

  onCreate: (
    options: CreateOptionData[],
  ) => void;

  onCancel: () => void;
}

export default function AddOption({
  menuProducts,
  onCreate,
  onCancel,
}: AddOptionProps) {
  const [mode, setMode] =
    useState<AddOptionMode>(null);

  /*
   * ELEGIR TIPO
   */

  if (!mode) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-slate-900">
              Agregar opción
            </h4>

            <p className="text-sm text-slate-500">
              Elegí cómo querés crearla.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* PRODUCTO */}

          <button
            type="button"
            onClick={() =>
              setMode("MENU")
            }
            className="flex flex-col items-start rounded-xl border bg-white p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
          >
            <PackagePlus className="mb-3 h-6 w-6 text-blue-600" />

            <span className="font-semibold text-slate-900">
              Producto existente
            </span>

            <span className="mt-1 text-sm text-slate-500">
              Usar productos que ya existen
              en el menú.
            </span>
          </button>

          {/* PERSONALIZADA */}

          <button
            type="button"
            onClick={() =>
              setMode("CUSTOM")
            }
            className="flex flex-col items-start rounded-xl border bg-white p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
          >
            <Plus className="mb-3 h-6 w-6 text-blue-600" />

            <span className="font-semibold text-slate-900">
              Nueva opción
            </span>

            <span className="mt-1 text-sm text-slate-500">
              Crear una opción personalizada.
            </span>
          </button>
        </div>
      </div>
    );
  }

  /*
   * OPCIÓN PERSONALIZADA
   */

  if (mode === "CUSTOM") {
    return (
      <CreateCustomOption
        onCreate={(option) => {
          onCreate([option]);
        }}
        onCancel={() =>
          setMode(null)
        }
      />
    );
  }

  /*
   * PRODUCTOS DEL MENÚ
   */

  return (
    <SelectMenuProducts
      menuProducts={menuProducts}
      onCreate={onCreate}
      onCancel={() =>
        setMode(null)
      }
    />
  );
}