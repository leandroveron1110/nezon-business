"use client";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useTransition,
  useDeferredValue,
  memo,
  useCallback,
} from "react";

import {
  Package,
  PlusCircle,
  CheckCircle2,
  CornerDownLeft,
  Search,
  X,
} from "lucide-react";

import { LocalProduct } from "@/mini-back/infrastructure/dexie/shcema/products.schema";
import { formatPrice } from "@/features/common/utils/formatPrice";

interface ProductPanelProps {
  products: LocalProduct[];
  onProductClick: (p: LocalProduct) => void;
}

const ProductCard = memo(function ProductCard({
  product,
  isHighlighted,
  isLastAdded,
  onClick,
}: {
  product: LocalProduct;
  isHighlighted: boolean;
  isLastAdded: boolean;
  onClick: (p: LocalProduct) => void;
}) {
  // Colores de alta visibilidad para escaneo veloz en caja
  const cardStyles = isLastAdded
    ? "border-emerald-500 bg-emerald-50 shadow-inner"
    : isHighlighted
      ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20 shadow-md"
      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md";

  const textPriceStyles = isLastAdded || isHighlighted
    ? "text-emerald-700"
    : "text-slate-900";

  const iconStyles = isLastAdded || isHighlighted
    ? "text-emerald-600"
    : "text-slate-300 group-hover:text-slate-500";

  return (
    <div
      onClick={() => onClick(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(product);
      }}
      className={`
        relative flex flex-col p-3 text-left 
        rounded-2xl border transition-all duration-100
        active:scale-[0.97] active:bg-slate-50 cursor-pointer select-none 
        ${cardStyles}
      `}
    >
      {/* Información del producto compactada de arriba hacia abajo sin huecos */}
      <div className={`w-full ${isHighlighted ? "pr-12" : ""}`}>
        <p className="line-clamp-2 text-[11px] font-black uppercase leading-tight tracking-tight text-slate-800 transition-colors group-hover:text-slate-950">
          {product.name}
        </p>
      </div>

      {/* Precio e Icono pegados inmediatamente abajo del texto */}
      <div className="mt-1.5 flex items-center justify-between gap-2 w-full">
        <div className="min-w-0 flex-1">
          <span
            className={`block truncate text-base font-black tracking-tight ${textPriceStyles}`}
          >
            {formatPrice(product.finalPrice)}
          </span>
        </div>

        <div
          className={`shrink-0 transition-transform duration-100 group-hover:scale-105 ${iconStyles}`}
        >
          {isLastAdded ? (
            <CheckCircle2 size={18} className="stroke-[2.5]" />
          ) : (
            <PlusCircle size={18} className="stroke-[2.5]" />
          )}
        </div>
      </div>

      {/* Badge de ENTER fijo arriba a la derecha */}
      {isHighlighted && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-md">
          <span>ENTER</span>
          <CornerDownLeft size={8} className="stroke-[3]" />
        </div>
      )}
    </div>
  );
});

export function ProductPanel({ products, onProductClick }: ProductPanelProps) {
  const [search, setSearch] = useState("");
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (!lastAddedId) return;

    const timer = setTimeout(() => {
      setLastAddedId(null);
    }, 700);

    return () => clearTimeout(timer);
  }, [lastAddedId]);

  const filteredProducts = useMemo(() => {
    const term = deferredSearch.toLowerCase().trim();

    if (!term) {
      return products.slice(0, 60);
    }

    const keywords = term
      .split(" ")
      .map((k) => k.trim())
      .filter(Boolean);

    return products
      .filter((product) => {
        const name = product.name.toLowerCase();
        return keywords.every((keyword) => name.includes(keyword));
      })
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        const aStarts = aName.startsWith(term);
        const bStarts = bName.startsWith(term);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        const aIncludes = aName.includes(term);
        const bIncludes = bName.includes(term);

        if (aIncludes && !bIncludes) return -1;
        if (!aIncludes && bIncludes) return 1;

        return aName.localeCompare(bName);
      })
      .slice(0, 80);
  }, [products, deferredSearch]);

  // Usamos useCallback para que la referencia no cambie y ProductCard no se re-renderee al tipear
  const handleProductAction = useCallback(
    (product: LocalProduct) => {
      onProductClick(product);
      setLastAddedId(product.id);

      if (window.innerWidth > 768) {
        inputRef.current?.focus();
      }
    },
    [onProductClick],
  );

  const clearSearch = () => {
    startTransition(() => {
      setSearch("");
    });
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50">
      {/* SEARCH CONTAINER - Más estilizado y plano */}
      <div className="shrink-0 border-b border-slate-200 bg-white p-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 stroke-[2.2]"
          />

          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por código o nombre de producto..."
            autoComplete="off"
            spellCheck={false}
            className="
              w-full
              rounded-xl
              border-2
              border-slate-200
              bg-slate-50
              py-2.5
              pl-10
              pr-24
              text-xs
              font-bold
              uppercase
              tracking-wide
              text-slate-800
              outline-none
              transition-all
              placeholder:text-slate-400 placeholder:normal-case placeholder:font-medium
              focus:border-emerald-600
              focus:bg-white
            "
          />

          {search.length > 0 && (
            <button
              onClick={clearSearch}
              className="
                absolute
                right-2
                top-1/2
                flex
                -translate-y-1/2
                items-center
                gap-1
                rounded-lg
                bg-slate-100
                px-2
                py-1
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                text-slate-500
                transition-colors
                hover:bg-slate-200
              "
            >
              <X size={12} className="stroke-[2.5]" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* FEEDBACK FLOATING - Corregido y adaptado a Nezon */}
      {lastAddedId && (
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-20
            z-[100]
            flex
            -translate-x-1/2
            items-center
            gap-2
            rounded-xl
            bg-emerald-600
            px-4
            py-2
            text-white
            shadow-xl shadow-emerald-900/10
            animate-in
            fade-in
            slide-in-from-top-2
            duration-200
          "
        >
          <CheckCircle2 size={14} className="stroke-[2.5]" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Agregado a la comanda
          </span>
        </div>
      )}

      {/* GRID - Con fondo suave para resaltar las tarjetas del catálogo */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {filteredProducts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-20 text-slate-400">
            <Package size={40} className="mb-3 opacity-25 stroke-[1.5]" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sin resultados para la búsqueda
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-2
              gap-2.5
              sm:grid-cols-3
              md:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              2xl:grid-cols-5
            "
          >
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                isHighlighted={index === 0 && search.trim().length > 0}
                isLastAdded={lastAddedId === product.id}
                onClick={handleProductAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* FOOTER MINIMALISTA - Integrado visualmente, sin bloques negros duros */}
      <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-4 py-2">
        <span className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
          {search.trim().length > 0
            ? `${filteredProducts.length} coincidencias`
            : `${products.length} productos disponibles`}
        </span>

        <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Catálogo Sincronizado
          </span>
        </div>
      </div>
    </div>
  );
}
