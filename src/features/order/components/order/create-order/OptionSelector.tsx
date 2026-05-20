"use client";

import { LocalOrderOptionGroup } from "@/mini-back/infrastructure/dexie/shcema/orders.schema";
import { LocalOption, LocalProduct } from "@/mini-back/infrastructure/dexie/shcema/products.schema";
import { useState } from "react";

interface Props {
  product: LocalProduct;
  onConfirm: (selected: LocalOrderOptionGroup[]) => void;
  onClose: () => void;
}

export function OptionSelector({ product, onConfirm, onClose }: Props) {
  const [selections, setSelections] = useState<LocalOrderOptionGroup[]>(
    product.optionGroups.map(g => ({ groupName: g.name, options: [] }))
  );

  const toggleOption = (groupId: string, option: LocalOption) => {
    setSelections(prev =>
      prev.map(group => {
        if (group.groupName !== groupId) return group;

        const exists = group.options.find(o => o.optionId === option.id);

        if (exists) {
          return {
            ...group,
            options: group.options.filter(o => o.optionId !== option.id),
          };
        }

        return {
          ...group,
          options: [
            ...group.options,
            {
              optionId: option.id,
              optionName: option.name,
              priceFinal: option.priceFinal,
              quantity: 1,
            },
          ],
        };
      })
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-end md:items-center justify-center">
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl overflow-hidden">

        <div className="p-4 border-b">
          <h3 className="font-bold">{product.name}</h3>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {product.optionGroups.map(group => (
            <div key={group.id}>
              <h4 className="text-xs text-gray-400 font-bold mb-1">{group.name}</h4>

              <div className="grid gap-2">
                {group.options.map(opt => {
                  const selected = selections
                    .find(g => g.groupName === group.name)
                    ?.options.some(o => o.optionId === opt.id);

                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(group.name, opt)}
                      className={`p-3 rounded-xl border text-left flex justify-between active:scale-95 transition ${
                        selected ? "bg-green-100 border-green-500" : "border-gray-200"
                      }`}
                    >
                      <span>{opt.name}</span>
                      <span className="font-bold text-sm">
                        {opt.priceFinal > 0 ? `+$${opt.priceFinal}` : "Gratis"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 flex gap-2">
          <button onClick={onClose} className="flex-1 p-3 border rounded-xl">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(selections)}
            className="flex-1 p-3 bg-green-600 text-white rounded-xl font-bold"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}