"use client";

import React, { useState } from "react";
import { MenuCreate } from "../../types/catlog";
import { Plus, X, Check } from "lucide-react";

interface Props {
  businessId: string;
  ownerId: string;
  onAddMenu: (menu: MenuCreate) => void;
}

export default function NewCatalogMenu({
  businessId,
  ownerId,
  onAddMenu,
}: Props) {
  const [name, setName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;

    onAddMenu({
      name: name.trim().toUpperCase(),
      businessId,
      ownerId,
    });

    setName("");
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Crear nuevo menú
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Los menús agrupan las diferentes secciones de tu catálogo.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nombre del menú
            </label>

            <input
              autoFocus
              type="text"
              placeholder="Ej. DESAYUNOS"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setName("");
                setIsAdding(false);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Crear menú
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="group flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white px-8 py-14 transition hover:border-gray-400 hover:bg-gray-50"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 transition group-hover:scale-110 group-hover:bg-gray-200">
        <Plus className="h-8 w-8 text-gray-700" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-gray-900">
        Crear nuevo menú
      </h3>

      <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
        Crea un menú para organizar productos como desayunos, almuerzos,
        bebidas o promociones.
      </p>
    </button>
  );
}