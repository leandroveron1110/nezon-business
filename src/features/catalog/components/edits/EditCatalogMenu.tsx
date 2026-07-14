"use client";

import React, { useState } from "react";
import { AlertCircle, Check, Trash2, X } from "lucide-react";

interface Props {
  name: string;
  onSave: (newName: string) => void;
  onDelete: () => void;
  onCancel?: () => void;
  ownerId: string;
}

export default function EditCatalogMenu({
  name,
  onSave,
  onDelete,
  onCancel,
  ownerId,
}: Props) {
  const [tempName, setTempName] = useState(name);
  const [error, setError] = useState<string | null>(null);

  if (!ownerId) return null;

  const handleSave = () => {
    if (!tempName.trim()) {
      setError("El nombre del menú es obligatorio.");
      return;
    }

    setError(null);
    onSave(tempName.trim());
  };

  const handleCancel = () => {
    setTempName(name);
    setError(null);
    onCancel?.();
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          Editar menú
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Cambia el nombre del menú o elimínalo si ya no lo necesitas.
        </p>
      </div>

      {/* Formulario */}
      <div className="mt-6 space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Nombre del menú
          </label>

          <input
            autoFocus
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Ej. MENÚ PRINCIPAL"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />

            <div>
              <p className="font-medium text-red-700">
                No se pudo guardar
              </p>

              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 font-medium text-red-600 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar menú
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>

            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 font-medium text-white transition hover:bg-black"
            >
              <Check className="h-4 w-4" />
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}