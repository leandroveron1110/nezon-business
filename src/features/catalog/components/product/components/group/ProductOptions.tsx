"use client";

import { useState } from "react";

import type {
  IOptionGroup,
} from "@/features/catalog/types/catlog";

import type {
  AvailableMenuProduct,
  CreateOptionData,
  CreateOptionGroupData,
} from "@/features/catalog/types/product-options";

import OptionGroupCard from "./OptionGroupCard";
import CreateOptionGroup from "./CreateOptionGroup";

interface ProductOptionsProps {
  productId: string;

  groups: IOptionGroup[];

  menuProducts: AvailableMenuProduct[];

  onCreateGroup: (
    data: CreateOptionGroupData,
  ) => void;

  onUpdateGroup: (
    groupId: string,
    data: Partial<IOptionGroup>,
  ) => void;

  onDeleteGroup: (
    groupId: string,
  ) => void;

  onCreateOptions: (
    groupId: string,
    options: CreateOptionData[],
  ) => void;

  onDeleteOption: (
    groupId: string,
    optionId: string,
  ) => void;
}

export default function ProductOptions({
  productId,
  groups,
  menuProducts,

  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,

  onCreateOptions,
  onDeleteOption,
}: ProductOptionsProps) {
  const [creatingGroup, setCreatingGroup] =
    useState(false);

  return (
    <div className="space-y-4">
      {/* GRUPOS */}

      {groups.map((group) => (
        <OptionGroupCard
          key={group.id}
          group={group}
          menuProducts={menuProducts}
          onUpdateGroup={onUpdateGroup}
          onDeleteGroup={onDeleteGroup}
          onCreateOptions={
            onCreateOptions
          }
          onDeleteOption={
            onDeleteOption
          }
        />
      ))}

      {/* CREAR GRUPO */}

      {creatingGroup ? (
        <CreateOptionGroup
          onCreate={(data) => {
            onCreateGroup(data);

            setCreatingGroup(false);
          }}
          onCancel={() =>
            setCreatingGroup(false)
          }
        />
      ) : (
        <button
          type="button"
          onClick={() =>
            setCreatingGroup(true)
          }
          className="w-full rounded-xl border-2 border-dashed border-slate-300 p-5 text-sm font-semibold text-blue-600 transition hover:border-blue-400 hover:bg-blue-50"
        >
          + Crear grupo de opciones
        </button>
      )}
    </div>
  );
}