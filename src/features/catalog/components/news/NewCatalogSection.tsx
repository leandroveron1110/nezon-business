"use client";

import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { SectionCreate } from "../../types/catlog";

interface NewCatalogSectionProps {
  businessId: string;
  menuId: string;
  ownerId: string;
  currentIndex: number;
  onAddSection: (section: SectionCreate) => void;
}

export default function NewCatalogSection({
  businessId,
  menuId,
  ownerId,
  currentIndex,
  onAddSection,
}: NewCatalogSectionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;

    onAddSection({
      businessId,
      menuId,
      ownerId,
      imageUrls: [],
      name: name.trim().toUpperCase(),
      index: currentIndex,
    });

    setName("");
    setIsCreating(false);
  };

  if (!isCreating) {
    return (
      <button
        onClick={() => setIsCreating(true)}
        className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition hover:border-gray-400 hover:bg-gray-100"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:scale-110">
          <Plus className="h-7 w-7 text-gray-700" />
        </div>

        <span className="mt-4 text-lg font-semibold text-gray-900">
          Crear nueva sección
        </span>

        <span className="mt-2 max-w-sm text-center text-sm text-gray-500">
          Organiza los productos agrupándolos por categorías como pizzas,
          bebidas, postres o promociones.
        </span>
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Nueva sección
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Dale un nombre para comenzar a agregar productos.
        </p>
      </div>

      <div className="space-y-5 p-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Nombre de la sección
          </label>

          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            placeholder="Ej. PIZZAS"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setName("");
              setIsCreating(false);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>

          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Crear sección
          </button>
        </div>
      </div>
    </section>
  );
}