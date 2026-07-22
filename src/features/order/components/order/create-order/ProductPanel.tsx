"use client";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useTransition,
  useDeferredValue,
  memo,
} from "react";
import {
  Package,
  CheckCircle2,
  CornerDownLeft,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { LocalProduct } from "@/mini-back/infrastructure/dexie/shcema/products.schema";
import { formatPrice } from "@/features/common/utils/formatPrice";
import { useConnectivity } from "@/lib/hooks/useConnectivity";

// Flag de UX Configurable según el punto 4 de la auditoría
const CLEAR_SEARCH_AFTER_ADD = false;

const ProductCard = memo(function ProductCard({
  product,
  isLastAdded,
  onClickDirect,
  onClickCustomize,
}: {
  product: LocalProduct;
  isLastAdded: boolean;
  onClickDirect: (p: LocalProduct) => void;
  onClickCustomize: (p: LocalProduct) => void;
}) {
  const cardStyles = isLastAdded
    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
    : "border-slate-200 bg-white hover:border-slate-300";

  return (
    <div
      onClick={(e) => {
        // Atajo: Ctrl + Click o Cmd + Click abre la personalización/nota
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onClickCustomize(product);
        } else {
          onClickDirect(product);
        }
      }}
      className={`
        relative flex flex-col justify-between p-2 text-left h-16
        rounded-xl border transition-all duration-75
        active:scale-[0.97] cursor-pointer select-none group
        ${cardStyles}
      `}
      title="Click: Agregar directo | Ctrl + Click: Personalizar / Agregar nota"
    >
      {/* Botón de Ajustes (Se frena la propagación para evitar doble disparo) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClickCustomize(product);
        }}
        className="absolute top-1 right-1 p-1 rounded-md bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-600 transition-colors z-10"
        title="Personalizar (Ctrl + Click en la tarjeta o click aquí)"
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
      </div>
    </div>
  );
});

export function ProductPanel({
  products,
  onProductClick,
  onProductCustomize,
  onCheckout,
  isModalOpen = false, // 🆕 Clave para pausar los eventos cuando se abre el modal de notas (Punto 8)
}: {
  products: LocalProduct[];
  onProductClick: (p: LocalProduct) => void;
  onProductCustomize: (p: LocalProduct) => void;
  onCheckout?: () => void;
  isModalOpen?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { isOnline } = useConnectivity();
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (!lastAddedId) return;
    const timer = setTimeout(() => setLastAddedId(null), 500);
    return () => clearTimeout(timer);
  }, [lastAddedId]);

  const indexedProducts = useMemo(() => {
    return products.map((product) => ({
      product,
      searchString: [product.name, product.description, product.sectionName]
        .join(" ")
        .toLowerCase(),
    }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = deferredSearch.toLowerCase().trim();

    if (!term) {
      return indexedProducts.slice(0, 80).map((p) => p.product);
    }

    const keywords = term.split(" ").filter(Boolean);

    const result: LocalProduct[] = [];

    for (const item of indexedProducts) {
      let matches = true;

      for (const keyword of keywords) {
        if (!item.searchString.includes(keyword)) {
          matches = false;
          break;
        }
      }

      if (matches) {
        result.push(item.product);

        if (result.length === 80) {
          break;
        }
      }
    }

    return result;
  }, [indexedProducts, deferredSearch]);

  // 🆕 Punto 2: Corregir de forma segura desbordes de índices cuando la lista se achica dinámicamente
  useEffect(() => {
    if (
      filteredProducts.length > 0 &&
      selectedIndex >= filteredProducts.length
    ) {
      setSelectedIndex(filteredProducts.length - 1);
    } else if (filteredProducts.length === 0) {
      setSelectedIndex(0);
    }
  }, [filteredProducts.length, selectedIndex]);

  const handleProductAction = (product: LocalProduct) => {
    if (!product) return;
    onProductClick(product);
    setLastAddedId(product.id);

    // Punto 4: Limpieza condicional configurable
    if (CLEAR_SEARCH_AFTER_ADD) {
      setSearch("");
    }

    // Punto 5: Mantener foco inteligente sin forzarlo agresivamente si el usuario cambió de input
    if (document.activeElement === inputRef.current) {
      inputRef.current?.focus();
    }
  };

  const clearSearch = () => {
    startTransition(() => setSearch(""));
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-100">
      {/* BARRA BUSQUEDA */}
      <div className="shrink-0 bg-white border-b p-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border bg-slate-50 py-1.5 pl-8 pr-20 text-xs font-bold uppercase tracking-wide text-slate-800 outline-none focus:border-emerald-600 focus:bg-white"
          />
          {search.length > 0 && (
            <button
              onClick={clearSearch}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded bg-slate-200 px-1.5 py-0.5 text-[8px] font-bold text-slate-600 hover:bg-slate-300"
            >
              <X size={10} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {lastAddedId && (
        <div className="pointer-events-none absolute left-1/4 top-16 z-50 flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-white shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
          <CheckCircle2 size={12} />
          <span className="text-[9px] font-black uppercase tracking-wider">
            Agregado
          </span>
        </div>
      )}

      {/* GRID DE ALTA DENSIDAD */}
      <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto p-2">
        {filteredProducts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-400 py-10">
            <Package size={24} className="opacity-30 mb-1" />
            <p className="text-[9px] font-bold uppercase">Sin productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                data-product-wrapper
                data-active={index === selectedIndex}
              >
                <ProductCard
                  product={product}
                  isLastAdded={lastAddedId === product.id}
                  onClickDirect={handleProductAction}
                  onClickCustomize={onProductCustomize}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MINI FOOTER */}
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
