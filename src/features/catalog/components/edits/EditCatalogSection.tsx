"use client";

import { useState } from "react";
import { IMenuSectionWithProducts } from "../../types/catlog";
import { z } from "zod";
import { Check, X, Trash, AlertCircle } from "lucide-react";

interface Props {
  section: IMenuSectionWithProducts;
  onUpdate: (data: { section: Partial<IMenuSectionWithProducts> }) => void;
  onDelete: (sectionId: string) => void;
  onCancel?: () => void;
}

const sectionSchema = z.object({
  name: z.string().min(1, "El nombre de la sección no puede estar vacío"),
  index: z.number().int().min(0, "El índice debe ser mayor o igual a 0"),
});

type TempSection = {
  name: string;
  index: number;
};

export default function EditCatalogSection({
  section,
  onUpdate,
  onDelete,
  onCancel,
}: Props) {
  const [temp, setTemp] = useState<TempSection>({
    name: section.name,
    index: section.index,
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = <K extends keyof TempSection>(
    field: K,
    value: TempSection[K]
  ) => {
    setTemp((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getModifiedFields = (): Partial<IMenuSectionWithProducts> => {
    const modified: Record<string, unknown> = {
      id: section.id,
    };

    (Object.keys(temp) as (keyof TempSection)[]).forEach((key) => {
      if (temp[key] !== section[key]) {
        modified[key] = temp[key];
      }
    });

    return modified as Partial<IMenuSectionWithProducts>;
  };

  const handleSave = () => {
    const modified = getModifiedFields();

    if (Object.keys(modified).length === 1) {
      onCancel?.();
      return;
    }

    const validation = sectionSchema.safeParse({
      ...section,
      ...modified,
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setError(null);

    onUpdate({
      section: modified,
    });

    onCancel?.();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5">
        <p className="mt-1 text-sm text-gray-500">
          Modifica el nombre o el orden en que aparece esta sección dentro del
          menú.
        </p>
      </div>

      {/* Body */}
      <div className="space-y-6 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nombre
            </label>

            <input
              type="text"
              value={temp.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej. Pizzas"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Orden
            </label>

            <input
              type="number"
              value={temp.index}
              onChange={(e) =>
                handleChange("index", Number(e.target.value))
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />

            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <button
          onClick={() => onDelete(section.id)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash className="h-4 w-4" />
          Eliminar sección
        </button>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
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
  );
}