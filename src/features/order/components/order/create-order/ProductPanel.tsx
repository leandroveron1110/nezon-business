"use client";

import { useState, useMemo, useEffect, useRef, useTransition, useDeferredValue, memo } from "react";
import { Package, CheckCircle2, CornerDownLeft, Search, X, SlidersHorizontal } from "lucide-react";
import { LocalProduct } from "@/mini-back/infrastructure/dexie/shcema/products.schema";
import { formatPrice } from "@/features/common/utils/formatPrice";
import { useConnectivity } from "@/lib/hooks/useConnectivity";

const ProductCard = memo(function ProductCard({
  product,
  isHighlighted,
  isLastAdded,
  onClickDirect,
  onClickCustomize,
}: {
  product: LocalProduct;
  isHighlighted: boolean;
  isLastAdded: boolean;
  onClickDirect: (p: LocalProduct) => void;
  onClickCustomize: (p: LocalProduct) => void;
}) {
  const cardStyles = isLastAdded
    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
    : isHighlighted
      ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500/30"
      : "border-slate-200 bg-white hover:border-slate-300";

  return (
    <div
      onClick={() => onClickDirect(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClickDirect(product);
      }}
      className={`
        relative flex flex-col justify-between p-2 text-left h-16
        rounded-xl border transition-all duration-75
        active:scale-[0.97] cursor-pointer select-none group
        ${cardStyles}
      `}
    >
      {/* Botón rápido para abrir notas o adicionales sin agregar directo */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Evita que se agregue directo
          onClickCustomize(product);
        }}
        className="absolute top-1 right-1 p-1 rounded-md bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-600 transition-colors z-10"
        title="Agregar con nota o adicionales"
      >
        <SlidersHorizontal size={10} />
      </button>

      <div className="w-full pr-5">
        <p className="line-clamp-2 text-[10px] font-black uppercase leading-tight tracking-tight text-slate-700 group-hover:text-slate-900">
          {product.name}
        </p>
      </div>

      <div className="flex items-center justify-between gap-1 w-full mt-0.5">
        <span className="text-xs font-black tracking-tight text-slate-900">
          {formatPrice(product.finalPrice)}
        </span>
        {isHighlighted && (
          <span className="flex items-center gap-0.5 rounded bg-amber-500 px-1 py-0.5 text-[7px] font-black text-white">
            ENTER <CornerDownLeft size={6} />
          </span>
        )}
      </div>
    </div>
  );
});

export function ProductPanel({ 
  products, 
  onProductClick,
  onProductCustomize 
}: { 
  products: LocalProduct[]; 
  onProductClick: (p: LocalProduct) => void;
  onProductCustomize: (p: LocalProduct) => void; // 🆕 Nueva prop
}) {
  const [search, setSearch] = useState("");
  const { isOnline } = useConnectivity();
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (!lastAddedId) return;
    const timer = setTimeout(() => setLastAddedId(null), 500);
    return () => clearTimeout(timer);
  }, [lastAddedId]);

  const filteredProducts = useMemo(() => {
    const term = deferredSearch.toLowerCase().trim();
    if (!term) return products.slice(0, 80);

    const keywords = term.split(" ").filter(Boolean);
    return products
      .filter((p) => {
        const name = p.name.toLowerCase();
        return keywords.every((k) => name.includes(k));
      })
      .slice(0, 80);
  }, [products, deferredSearch]);

  const handleProductAction = (product: LocalProduct) => {
    onProductClick(product);
    setLastAddedId(product.id);
    if (window.innerWidth > 768) {
      inputRef.current?.focus();
    }
  };

  const clearSearch = () => {
    startTransition(() => setSearch(""));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      clearSearch();
    }
    if (e.key === "Enter" && filteredProducts.length > 0) {
      e.preventDefault();
      handleProductAction(filteredProducts[0]);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-100">
      <div className="shrink-0 bg-white border-b p-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribí para buscar..."
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border bg-slate-50 py-1.5 pl-8 pr-20 text-xs font-bold uppercase tracking-wide text-slate-800 outline-none focus:border-emerald-600 focus:bg-white"
          />
          {search.length > 0 && (
            <button onClick={clearSearch} className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded bg-slate-200 px-1.5 py-0.5 text-[8px] font-bold text-slate-600 hover:bg-slate-300">
              <X size={10} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {lastAddedId && (
        <div className="pointer-events-none absolute left-1/4 top-16 z-50 flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-white shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
          <CheckCircle2 size={12} />
          <span className="text-[9px] font-black uppercase tracking-wider">Agregado</span>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filteredProducts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-400 py-10">
            <Package size={24} className="opacity-30 mb-1" />
            <p className="text-[9px] font-bold uppercase">Sin productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                isHighlighted={index === 0 && search.trim().length > 0}
                isLastAdded={lastAddedId === product.id}
                onClickDirect={handleProductAction}
                onClickCustomize={onProductCustomize} // 🆕 Pasa la acción del modal custom
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t bg-white px-3 py-1 text-[9px] font-bold text-slate-400 uppercase">
        <span>{filteredProducts.length} items</span>
        <span className="flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-emerald-500" />
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
}