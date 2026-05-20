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
  return (
    <button
      onClick={() => onClick(product)}
      className={`
        relative
        flex
        min-h-[110px]
        flex-col
        justify-between
        rounded-2xl
        border
        p-3
        text-left
        transition-all
        duration-150
        active:scale-[0.98]
        group

        ${
          isLastAdded
            ? "border-emerald-500 bg-emerald-50 shadow-inner"
            : isHighlighted
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10 shadow-md"
              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
        }
      `}
    >
      {/* Contenedor del nombre con padding dinámico si está destacado para que NADA se solape */}
      <div className={`flex-1 w-full ${isHighlighted ? "pr-12" : ""}`}>
        <p
          className="
            line-clamp-3
            text-[11px]
            font-black
            uppercase
            leading-tight
            tracking-tight
            text-slate-800
            transition-colors
            group-hover:text-slate-950
          "
        >
          {product.name}
        </p>
      </div>

      {/* Badge de ENTER posicionado de forma fija en la esquina superior derecha sin pisar el flujo del texto */}
      {isHighlighted && (
        <div
          className="
            absolute
            right-2
            top-2
            z-10
            flex
            items-center
            gap-1
            rounded-md
            bg-blue-600
            px-1.5
            py-0.5
            text-[8px]
            font-black
            uppercase
            tracking-wider
            text-white
            shadow-md
          "
        >
          ENTER
          <CornerDownLeft size={8} className="stroke-[3]" />
        </div>
      )}

      <div className="mt-3 flex items-end justify-between gap-2 w-full">
        <div className="min-w-0 flex-1">
          <span
            className={`
              block
              truncate
              text-base
              font-black
              tracking-tight

              ${
                isLastAdded
                  ? "text-emerald-700"
                  : isHighlighted
                    ? "text-blue-700"
                    : "text-slate-900"
              }
            `}
          >
            {formatPrice(product.finalPrice)}
          </span>
        </div>

        <div
          className={`
            shrink-0
            transition-all
            duration-150
            group-hover:scale-110

            ${
              isLastAdded
                ? "text-emerald-600"
                : isHighlighted
                  ? "text-blue-600"
                  : "text-slate-300"
            }
          `}
        >
          {isLastAdded ? (
            <CheckCircle2 size={20} className="stroke-[2.5]" />
          ) : (
            <PlusCircle size={20} className="stroke-[2.5]" />
          )}
        </div>
      </div>
    </button>
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
  const handleProductAction = useCallback((product: LocalProduct) => {
    onProductClick(product);
    setLastAddedId(product.id);

    if (window.innerWidth > 768) {
      inputRef.current?.focus();
    }
  }, [onProductClick]);

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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-100">
      {/* SEARCH */}
      <div className="shrink-0 border-b bg-white p-2 shadow-sm">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar producto..."
            autoComplete="off"
            spellCheck={false}
            className="
              w-full
              rounded-2xl
              border-2
              border-slate-200
              bg-slate-50
              py-3
              pl-10
              pr-24
              text-sm
              font-black
              uppercase
              tracking-wide
              text-slate-800
              outline-none
              transition-all
              placeholder:text-slate-400
              focus:border-blue-600
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
                rounded-xl
                bg-slate-200
                px-2
                py-1.5
                text-[10px]
                font-black
                uppercase
                tracking-wide
                text-slate-600
                transition-colors
                hover:bg-slate-300
              "
            >
              <X size={12} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* FEEDBACK FLOATING */}
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
            rounded-full
            bg-emerald-600
            px-5
            py-2.5
            text-white
            shadow-2xl
            animate-in
            fade-in
            slide-in-from-top-2
          "
        >
          <CheckCircle2 size={16} />
          <span className="text-xs font-black uppercase tracking-wider">
            Producto agregado
          </span>
        </div>
      )}

      {/* GRID */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filteredProducts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-slate-400">
            <Package size={48} className="mb-3 opacity-30" />
            <p className="text-sm font-black uppercase tracking-wider">
              Sin resultados
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-2
              gap-2
              sm:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5
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

      {/* FOOTER */}
      <div className="flex shrink-0 items-center justify-between border-t border-slate-800 bg-slate-900 px-3 py-2 text-white">
        <span className="truncate text-[10px] font-black uppercase tracking-wider text-slate-400">
          {search.trim().length > 0
            ? `${filteredProducts.length} resultados`
            : `${products.length} productos cargados`}
        </span>

        <div className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          <span className="text-[9px] font-black uppercase tracking-wide text-emerald-400">
            Activo
          </span>
        </div>
      </div>
    </div>
  );
}