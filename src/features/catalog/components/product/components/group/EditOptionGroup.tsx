"use client";

import { useEffect, useState } from "react";
import { IOptionGroup } from "@/features/catalog/types/catlog";
import { ArrowLeft } from "lucide-react";

interface EditOptionGroupProps {
  group: IOptionGroup;

  onSave: (
    data: Partial<IOptionGroup>,
  ) => void;

  onCancel: () => void;
}

export default function EditOptionGroup({
  group,
  onSave,
  onCancel,
}: EditOptionGroupProps) {
  const [name, setName] = useState(group.name);

  const [required, setRequired] = useState(
    group.minQuantity > 0,
  );

  const [multiple, setMultiple] = useState(
    group.maxQuantity > 1,
  );

  const [minQuantity, setMinQuantity] =
    useState(group.minQuantity);

  const [maxQuantity, setMaxQuantity] =
    useState(group.maxQuantity);

  useEffect(() => {
    setName(group.name);
    setRequired(group.minQuantity > 0);
    setMultiple(group.maxQuantity > 1);
    setMinQuantity(group.minQuantity);
    setMaxQuantity(group.maxQuantity);
  }, [group]);

  const handleSubmit = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    const finalMin = multiple
      ? required
        ? Math.max(1, minQuantity)
        : 0
      : required
        ? 1
        : 0;

    const finalMax = multiple
      ? Math.max(finalMin, maxQuantity)
      : 1;

    onSave({
      name: name.trim(),
      minQuantity: finalMin,
      maxQuantity: finalMax,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-100 bg-slate-50 p-5"
    >
      <button
        type="button"
        onClick={onCancel}
        className="mb-4 flex items-center gap-2 text-sm text-slate-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Cancelar edición
      </button>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Nombre
          </label>

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full rounded-xl border bg-white px-3 py-2.5"
          />
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) =>
              setRequired(e.target.checked)
            }
          />

          <span className="text-sm">
            Selección obligatoria
          </span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={multiple}
            onChange={(e) =>
              setMultiple(e.target.checked)
            }
          />

          <span className="text-sm">
            Permitir elegir varias opciones
          </span>
        </label>

        {multiple && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm">
                Mínimo
              </label>

              <input
                type="number"
                min={required ? 1 : 0}
                value={minQuantity}
                onChange={(e) =>
                  setMinQuantity(
                    Number(e.target.value),
                  )
                }
                className="w-full rounded-xl border bg-white px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm">
                Máximo
              </label>

              <input
                type="number"
                min={1}
                value={maxQuantity}
                onChange={(e) =>
                  setMaxQuantity(
                    Number(e.target.value),
                  )
                }
                className="w-full rounded-xl border bg-white px-3 py-2"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border px-4 py-2 text-sm"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Guardar grupo
        </button>
      </div>
    </form>
  );
}