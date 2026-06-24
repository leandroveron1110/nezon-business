"use client";

import { LocalOrderOptionGroup } from "@/mini-back/infrastructure/dexie/shcema/orders.schema";
import { LocalOption, LocalProduct } from "@/mini-back/infrastructure/dexie/shcema/products.schema";
import { useState } from "react";
import { FileText } from "lucide-react"; // Importamos icono descriptivo

interface Props {
  product: LocalProduct;
  onConfirm: (selected: LocalOrderOptionGroup[], notes: string) => void; // 🆕 Recibe la nota en el confirm
  onClose: () => void;
}

export function OptionSelector({ product, onConfirm, onClose }: Props) {
  const [selections, setSelections] = useState<LocalOrderOptionGroup[]>(
    product.optionGroups?.map(g => ({ groupName: g.name, options: [] })) || []
  );
  const [notes, setNotes] = useState(""); // 🆕 Estado local para la nota del ítem

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
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-end md:items-center justify-center backdrop-blur-sm">
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        <div className="p-4 border-b shrink-0 bg-slate-50">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">Configurar ítem</span>
          <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">{product.name}</h3>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* GRUPOS DE OPCIONES SI TIENE */}
          {product.optionGroups && product.optionGroups.map(group => (
            <div key={group.id}>
              <h4 className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">{group.name}</h4>

              <div className="grid gap-2">
                {group.options.map(opt => {
                  const selected = selections
                    .find(g => g.groupName === group.name)
                    ?.options.some(o => o.optionId === opt.id);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleOption(group.name, opt)}
                      className={`p-3 rounded-xl border text-left flex justify-between active:scale-95 transition ${
                        selected ? "bg-green-100 border-green-500 text-green-900 font-bold" : "border-gray-200 text-slate-700"
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

          {/* 🆕 SECCIÓN DE NOTAS DE COCINA DIRECTAS */}
          <div className="pt-2">
            <div className="flex items-center gap-1 mb-1.5 text-orange-600">
              <FileText size={13} />
              <h4 className="text-xs font-black uppercase tracking-wider">Aclaración / Nota de cocina</h4>
            </div>
            <textarea
              rows={3}
              autoFocus={!product.optionGroups?.length} // Si no hay opciones, hace foco directo en la nota
              placeholder="Ej: Sin queso, salsa aparte, bien cocido..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none text-slate-800 focus:border-orange-400 focus:bg-white resize-none leading-normal transition-all"
            />
          </div>
        </div>

        <div className="p-4 flex gap-2 border-t bg-slate-50 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 p-3 border rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 bg-white hover:bg-slate-100">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selections, notes)} // 🆕 Mandamos las selecciones y la nota escrita
            className="flex-1 p-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-emerald-500 shadow-md"
          >
            Agregar al pedido
          </button>
        </div>
      </div>
    </div>
  );
}