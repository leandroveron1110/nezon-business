"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { LocalProduct } from "@/features/common/database/shcema/products.schema";
import { Search, Package, PlusCircle, Command } from "lucide-react";

export function ProductPanel({
  products,
  onProductClick,
}: {
  products: LocalProduct[];
  onProductClick: (p: LocalProduct) => void;
}) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Optimización de Búsqueda: Normalización y rapidez
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return products;

    return products
      .filter((p) => {
        const name = p.name.toLowerCase();
        // Permite buscar por partes, ej: "hamb que" para "Hamburguesa con queso"
        const keywords = term.split(" ");
        return keywords.every((key) => name.includes(key));
      })
      .sort((a, b) => a.name.length - b.name.length) // Los más cortos primero (más relevantes)
      .slice(0, 20); // Limitar a 20 resultados para velocidad instantánea de renderizado
  }, [products, search]);

  // 2. Atajos de Teclado: Enter selecciona el primero, Esc limpia
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearch("");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 h-full overflow-hidden">
      {/* SEARCH BAR - Más compacta y agresiva */}
      <div className="p-3 bg-white border-b shadow-sm">
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
          <input
            ref={inputRef}
            autoFocus
            placeholder="Presiona Enter para agregar el primer resultado..."
            value={search}
            onKeyDown={handleKeyDown}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-slate-100 border-2 border-transparent focus:border-blue-500 rounded-xl text-lg font-semibold outline-none transition-all placeholder:text-slate-400"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 opacity-40">
            <Command className="w-3 h-3" />
            <span className="text-xs font-bold">ENTER</span>
          </div>
        </div>
      </div>

      {/* PRODUCT GRID - Optimizado para Touch y Mouse */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Package className="w-12 h-12 mb-2 opacity-20" />
            <p className="font-medium">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
            {filtered.map((p, index) => (
              <button
                key={p.id}
                onClick={() => {
                  onProductClick(p);
                  inputRef.current?.focus(); // Mantener foco tras click
                }}
                // Resaltado especial para el primer elemento (el que se agregará con Enter)
                className={`group relative flex flex-col justify-between p-3 rounded-xl text-left transition-all active:scale-95 border-2 ${
                  index === 0 
                    ? "bg-blue-50 border-blue-200 shadow-md ring-2 ring-blue-400/20" 
                    : "bg-white border-transparent hover:border-slate-300"
                }`}
              >

                <div className="mt-2 mb-4">
                  <div className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 uppercase">
                    {p.name}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="px-2 py-1 bg-slate-900 rounded-lg">
                    <span className="text-white font-black text-sm">
                      ${p.finalPrice.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className={`p-1.5 rounded-full ${index === 0 ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <PlusCircle className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER INFORMATIVO */}
      <div className="px-4 py-2 bg-slate-900 text-white flex justify-between items-center">
        <div className="flex gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
              F1: Buscar
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
              ESC: Limpiar
            </span>
        </div>
        <span className="text-[10px] font-black bg-blue-600 px-2 py-0.5 rounded">
          {filtered.length} DISPONIBLES
        </span>
      </div>
    </div>
  );
}