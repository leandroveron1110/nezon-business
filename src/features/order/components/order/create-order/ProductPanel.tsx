"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { LocalProduct } from "@/features/common/database/shcema/products.schema";
import { Package, PlusCircle, CheckCircle2 } from "lucide-react";

export function ProductPanel({
  products,
  onProductClick,
}: {
  products: LocalProduct[];
  onProductClick: (p: LocalProduct) => void;
}) {
  const [search, setSearch] = useState("");
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Limpiar el estado de "agregado" después de 1 segundo
  useEffect(() => {
    if (lastAddedId) {
      const timer = setTimeout(() => setLastAddedId(null), 800);
      return () => clearTimeout(timer);
    }
  }, [lastAddedId]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return products.slice(0, 40); // Más productos si no hay búsqueda

    return products
      .filter((p) => {
        const name = p.name.toLowerCase();
        const keywords = term.split(" ");
        return keywords.every((key) => name.includes(key));
      })
      .sort((a, b) => a.name.length - b.name.length)
      .slice(0, 20);
  }, [products, search]);

  const handleAction = (product: LocalProduct) => {
    onProductClick(product);
    setLastAddedId(product.id);
    // En móvil a veces es mejor NO re-enfocar automáticamente 
    // para dejar que el usuario vea la lista, pero para desktop es clave.
    if (window.innerWidth > 768) inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setSearch("");
    if (e.key === "Enter" && filtered.length > 0) {
      handleAction(filtered[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-200 h-full overflow-hidden">
      {/* SEARCH BAR - Ultra compacta, sin lupa */}
      <div className="p-2 bg-white border-b shadow-sm">
        <div className="relative">
          <input
            ref={inputRef}
            placeholder="Buscar producto..."
            value={search}
            onKeyDown={handleKeyDown}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-slate-100 border-2 border-transparent focus:border-blue-500 rounded-lg text-base font-bold outline-none transition-all placeholder:text-slate-400 uppercase"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black bg-slate-300 px-2 py-1 rounded"
            >
              LIMPIAR
            </button>
          )}
        </div>
      </div>

      {/* FEEDBACK FLOTANTE PARA MÓVIL (Cuando el teclado tapa el grid) */}
      {lastAddedId && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span className="text-xs font-black uppercase">¡Agregado!</span>
        </div>
      )}

      {/* PRODUCT GRID */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 italic">
            <Package className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs font-bold">No hay resultados</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filtered.map((p, index) => {
              const isLastAdded = lastAddedId === p.id;
              const isFirst = index === 0 && search.length > 0;

              return (
                <button
                  key={p.id}
                  onClick={() => handleAction(p)}
                  className={`relative flex flex-col p-3 rounded-lg text-left transition-all border-2 
                    ${isLastAdded ? "bg-green-100 border-green-500 scale-95" : 
                      isFirst ? "bg-blue-50 border-blue-400 shadow-md" : "bg-white border-white active:bg-slate-50"}
                  `}
                >
                  <div className="h-8">
                    <span className="font-black text-slate-800 text-[11px] leading-tight line-clamp-2 uppercase">
                      {p.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-auto ">
                    <span className="text-blue-700 font-black text-sm">
                      ${p.finalPrice.toLocaleString('es-AR')}
                    </span>
                    <div className={`${isLastAdded ? 'text-green-600' : isFirst ? 'text-blue-500' : 'text-slate-300'}`}>
                      {isLastAdded ? <CheckCircle2 size={18} /> : <PlusCircle size={18} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* MINI FOOTER TÁCTICO */}
      <div className="px-3 py-1.5 bg-slate-800 text-white flex justify-between items-center shrink-0">
        <span className="text-[9px] font-black opacity-50 uppercase tracking-tighter">
          {search ? `Resultados: ${filtered.length}` : 'Todos los productos'}
        </span>
        <div className="flex gap-2">
           <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
           <span className="text-[9px] font-black uppercase">Online</span>
        </div>
      </div>
    </div>
  );
}