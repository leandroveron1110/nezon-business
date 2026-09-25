"use client";

import { useEffect, useState } from "react";

import type { InventoryProductModel } from "@/mini-back/core/inventory-core/domain/models/inventory-product.model";
import type { InventoryLocationModel } from "@/mini-back/core/inventory-core/domain/models/inventory-location.model";
import type { InventoryStockModel } from "@/mini-back/core/inventory-core/domain/models/inventory-stock.model";
import type { InventoryLotModel } from "@/mini-back/core/inventory-core/domain/models/inventory-lot.model";

import StockTable from "./StockTable";
import ReceiveStockModal from "./ReceiveStockModal";
import ConsumeStockModal from "./ConsumeStockModal";
import AdjustStockModal from "./AdjustStockModal";
import TransferStockModal from "./TransferStockModal";

import { inventoryProductOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-product-orchestrator";
import { inventoryLocationOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-location-orchestrator";
import { inventoryStockOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-stock-orchestrator";
import { inventoryLotOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-lot-orchestrator";

interface StockOverviewProps {
  businessId: string;
}

type StockAction = "receive" | "consume" | "adjust" | "transfer" | null;

export default function StockOverview({ businessId }: StockOverviewProps) {
  const [products, setProducts] = useState<InventoryProductModel[]>([]);
  const [locations, setLocations] = useState<InventoryLocationModel[]>([]);
  const [lots, setLots] = useState<InventoryLotModel[]>([]);
  const [stock, setStock] = useState<InventoryStockModel[]>([]);

  const [selectedProductIdTemp, setSelectedProductIdTemp] = useState<string>("");
  const [selectedLocationIdTemp, setSelectedLocationIdTemp] = useState<string>("");

  const [selectedStockItem, setSelectedStockItem] = useState<InventoryStockModel | null>(null);

  const [action, setAction] = useState<StockAction>(null);
  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);

  async function loadInitialData() {
    setLoading(true);

    try {
      const [productsResult, locationsResult] = await Promise.all([
        inventoryProductOrchestrator.findByBusinessId(businessId),
        inventoryLocationOrchestrator.findAll(businessId),
      ]);

      setProducts(productsResult);
      setLocations(locationsResult);
    } catch (err) {
      console.error("Error al cargar productos y ubicaciones:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadStockAndLots() {
    setStockLoading(true);

    try {
      let result: InventoryStockModel[] = [];

      if (selectedProductIdTemp) {
        result = await inventoryStockOrchestrator.findByProduct(
          selectedProductIdTemp,
          selectedLocationIdTemp || undefined,
        );
      } else {
        result = await inventoryStockOrchestrator.findByBusinessId(businessId);

        if (selectedLocationIdTemp) {
          result = result.filter((item) => item.locationIdTemp === selectedLocationIdTemp);
        }
      }

      setStock(result);

      if (selectedProductIdTemp) {
        const productLots = await inventoryLotOrchestrator.findByProduct(selectedProductIdTemp);
        setLots(productLots);
      } else {
        const allLots = await inventoryLotOrchestrator.findByBusinessId(businessId);
        setLots(allLots);
      }
    } catch (err) {
      console.error("Error al cargar el stock:", err);
    } finally {
      setStockLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, [businessId]);

  useEffect(() => {
    loadStockAndLots();
  }, [selectedProductIdTemp, selectedLocationIdTemp]);

  const refreshStock = async () => {
    await loadStockAndLots();
  };

  const closeAction = () => {
    setAction(null);
    setSelectedStockItem(null);
  };

  const handleOpenReceive = (item?: InventoryStockModel) => {
    if (item) setSelectedStockItem(item);
    setAction("receive");
  };

  const handleOpenConsume = (item?: InventoryStockModel) => {
    if (item) setSelectedStockItem(item);
    setAction("consume");
  };

  const handleOpenAdjust = (item?: InventoryStockModel) => {
    if (item) setSelectedStockItem(item);
    setAction("adjust");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm font-medium text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Cargando inventario...
        </div>
      </div>
    );
  }

  const activeProductId = selectedStockItem?.inventoryProductIdTemp ?? selectedProductIdTemp;
  const activeLocationId = selectedStockItem?.locationIdTemp ?? selectedLocationIdTemp;

  return (
    <section className="space-y-6">
      {/* Header & Botones Principales */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Control de Stock
          </h1>
          <p className="text-sm text-slate-400">
            Monitoreá y gestioná las existencias por producto y ubicación.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!selectedProductIdTemp || !selectedLocationIdTemp}
            onClick={() => handleOpenReceive()}
            className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Ingresar
          </button>
          <button
            type="button"
            disabled={!selectedProductIdTemp || !selectedLocationIdTemp}
            onClick={() => handleOpenConsume()}
            className="rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-500 active:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            - Consumir
          </button>
          <button
            type="button"
            disabled={!selectedProductIdTemp || !selectedLocationIdTemp}
            onClick={() => handleOpenAdjust()}
            className="rounded-lg border border-slate-700/80 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 shadow-sm transition hover:border-indigo-500/40 hover:bg-slate-700/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ajustar
          </button>
          <button
            type="button"
            disabled={!selectedProductIdTemp || !selectedLocationIdTemp}
            onClick={() => setAction("transfer")}
            className="rounded-lg border border-slate-700/80 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 shadow-sm transition hover:border-indigo-500/40 hover:bg-slate-700/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Transferir
          </button>
        </div>
      </div>

      {/* Bar de Filtros Oscura con acento Azul/Indigo */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-indigo-500/10 bg-slate-900/60 p-4 backdrop-blur-sm shadow-sm">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Producto
          </label>
          <select
            className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={selectedProductIdTemp}
            onChange={(event) => setSelectedProductIdTemp(event.target.value)}
          >
            <option value="">Todos los productos</option>
            {products
              .filter((product) => product.isActive)
              .map((product) => (
                <option key={product.idTemp} value={product.idTemp}>
                  {product.name}
                </option>
              ))}
          </select>
        </div>

        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Ubicación
          </label>
          <select
            className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={selectedLocationIdTemp}
            onChange={(event) => setSelectedLocationIdTemp(event.target.value)}
          >
            <option value="">Todas las ubicaciones</option>
            {locations
              .filter((location) => location.isActive)
              .map((location) => (
                <option key={location.idTemp} value={location.idTemp}>
                  {location.name}
                </option>
              ))}
          </select>
        </div>

        {(selectedProductIdTemp || selectedLocationIdTemp) && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSelectedProductIdTemp("");
                setSelectedLocationIdTemp("");
              }}
              className="mt-5 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/10 hover:text-indigo-200"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {stockLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
          <p className="text-sm font-medium text-slate-400">Cargando existencias...</p>
        </div>
      ) : (
        <StockTable
          stock={stock}
          products={products}
          locations={locations}
          lots={lots}
          onOpenReceive={handleOpenReceive}
          onOpenConsume={handleOpenConsume}
          onOpenAdjust={handleOpenAdjust}
        />
      )}

      {action === "receive" && activeProductId && activeLocationId && (
        <ReceiveStockModal
          businessId={businessId}
          inventoryProductIdTemp={activeProductId}
          locationIdTemp={activeLocationId}
          defaultLotIdTemp={selectedStockItem?.lotIdTemp}
          onSuccess={refreshStock}
          onClose={closeAction}
        />
      )}

      {action === "consume" && activeProductId && activeLocationId && (
        <ConsumeStockModal
          businessId={businessId}
          inventoryProductIdTemp={activeProductId}
          locationIdTemp={activeLocationId}
          onSuccess={refreshStock}
          onClose={closeAction}
        />
      )}

      {action === "adjust" && activeProductId && activeLocationId && (
        <AdjustStockModal
          businessId={businessId}
          inventoryProductIdTemp={activeProductId}
          locationIdTemp={activeLocationId}
          onSuccess={refreshStock}
          onClose={closeAction}
        />
      )}

      {action === "transfer" && activeProductId && activeLocationId && (
        <TransferStockModal
          businessId={businessId}
          inventoryProductIdTemp={activeProductId}
          fromLocationIdTemp={activeLocationId}
          onSuccess={refreshStock}
          onClose={closeAction}
        />
      )}
    </section>
  );
}