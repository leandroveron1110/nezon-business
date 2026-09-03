"use client";

import { useState } from "react";

import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
} from "lucide-react";

import type { IOptionGroup } from "@/features/catalog/types/catlog";

import type {
  AvailableMenuProduct,
  CreateOptionData,
} from "@/features/catalog/types/product-options";

import OptionItem from "./OptionItem";
import AddOption from "./AddOption";

interface OptionGroupCardProps {
  group: IOptionGroup;

  menuProducts: AvailableMenuProduct[];

  onUpdateGroup: (groupId: string, data: Partial<IOptionGroup>) => void;

  onDeleteGroup: (groupId: string) => void;

  onCreateOptions: (groupId: string, options: CreateOptionData[]) => void;

  onDeleteOption: (groupId: string, optionId: string) => void;
}

export default function OptionGroupCard({
  group,
  menuProducts,

  onUpdateGroup,
  onDeleteGroup,
  onCreateOptions,
  onDeleteOption,
}: OptionGroupCardProps) {
  const [expanded, setExpanded] = useState(true);

  const [addingOption, setAddingOption] = useState(false);

  const isRequired = group.minQuantity > 0;

  const isSingle = group.maxQuantity === 1;

  const selectionText = isSingle
    ? group.minQuantity === 1
      ? "Elegir 1 opción"
      : "Elegir hasta 1 opción"
    : `Elegir de ${group.minQuantity} a ${group.maxQuantity}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {group.name}
            </h3>

            {isRequired ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                <CheckCircle2 className="h-3 w-3" />
                Obligatorio
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                <Circle className="h-3 w-3" />
                Opcional
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500">{selectionText}</p>

          <p className="mt-1 text-xs text-slate-400">
            {group.options?.length ?? 0} opciones
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onUpdateGroup(group.id, {})}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDeleteGroup(group.id)}
            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* CONTENIDO */}

      {expanded && (
        <div className="border-t border-slate-100 p-4">
          <div className="space-y-2">
            {(group.options ?? []).map((option) => (
              <OptionItem
                key={option.id}
                option={option}
                onDelete={(optionId) => onDeleteOption(group.id, optionId)}
              />
            ))}
          </div>

          {/* AGREGAR */}

          {addingOption ? (
            <AddOption
              menuProducts={menuProducts}
              onCreate={(options) => {
                onCreateOptions(group.id, options);

                setAddingOption(false);
              }}
              onCancel={() => setAddingOption(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingOption(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" />
              Agregar opción
            </button>
          )}
        </div>
      )}
    </div>
  );
}
