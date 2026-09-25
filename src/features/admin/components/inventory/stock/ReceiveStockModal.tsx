"use client";

import { FormEvent, useEffect, useState, useMemo } from "react";

import type { ReceiveStockInput } from "@/mini-back/core/inventory-core/inputs/stock/receive-stock.input";
import type { InventoryPresentationModel } from "@/mini-back/core/inventory-core/domain/models/inventory-presentation.model";
import type { InventoryLotModel } from "@/mini-back/core/inventory-core/domain/models/inventory-lot.model";
import type { InventoryProductModel } from "@/mini-back/core/inventory-core/domain/models/inventory-product.model";

import { InventoryMovementReason } from "@/mini-back/core/inventory-core/domain/enums/inventory-movement-reason.enum";

import { inventoryStockOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-stock-orchestrator";
import { inventoryPresentationOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-presentation-orchestrator";
import { inventoryLotOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-lot-orchestrator";
import { inventoryProductOrchestrator } from "@/mini-back/orchestrator/inventory/inventory-product-orchestrator";

interface ReceiveStockModalProps {
  businessId: string;
  inventoryProductIdTemp: string;
  locationIdTemp: string;
  defaultLotIdTemp?: string | null;
  onSuccess?: () => void;
  onClose: () => void;
  defaultShelfLifeDays?: number;
}

export default function ReceiveStockModal({
  businessId,
  inventoryProductIdTemp,
  locationIdTemp,
  defaultLotIdTemp,
  onSuccess,
  onClose,
  defaultShelfLifeDays = 3,
}: ReceiveStockModalProps) {
  const [product, setProduct] = useState<InventoryProductModel | null>(null);
  const [presentations, setPresentations] = useState<
    InventoryPresentationModel[]
  >([]);
  const [selectedPresentationId, setSelectedPresentationId] =
    useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState<InventoryMovementReason>(
    InventoryMovementReason.PRODUCTION,
  );

  const [useLot, setUseLot] = useState<boolean>(false);
  const [lots, setLots] = useState<InventoryLotModel[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<string>("AUTO_NEW");

  // Fechas memorizadas para evitar descalces por render
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const defaultExpStr = useMemo(() => {
    const exp = new Date();
    exp.setDate(exp.getDate() + defaultShelfLifeDays);
    return exp.toISOString().split("T")[0];
  }, [defaultShelfLifeDays]);

  const [manufactureDate, setManufactureDate] = useState(todayStr);
  const [expirationDate, setExpirationDate] = useState(defaultExpStr);
  const [customLotNumber, setCustomLotNumber] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [prod, presList, lotList] = await Promise.all([
          inventoryProductOrchestrator.findByIdTemp(inventoryProductIdTemp),
          inventoryPresentationOrchestrator.findByProduct(
            inventoryProductIdTemp,
          ),
          inventoryLotOrchestrator.findByProduct(inventoryProductIdTemp),
        ]);

        if (!active) return;

        setProduct(prod);
        setPresentations(presList);
        setLots(lotList);

        if (prod?.trackLots || defaultLotIdTemp) {
          setUseLot(true);
        }

        if (
          defaultLotIdTemp &&
          lotList.some((l) => l.idTemp === defaultLotIdTemp)
        ) {
          setSelectedLotId(defaultLotIdTemp);
        } else {
          setSelectedLotId("AUTO_NEW");
        }

        const defaultPres = presList.find((p) => p.isDefault);
        if (defaultPres) {
          setSelectedPresentationId(defaultPres.idTemp);
        } else if (presList.length > 0) {
          setSelectedPresentationId(presList[0].idTemp);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [inventoryProductIdTemp, defaultLotIdTemp]);

  const activePresentation = presentations.find(
    (p) => p.idTemp === selectedPresentationId,
  );
  const calculatedBaseQuantity = useMemo(() => {
    const parsedQty = Number(quantity) || 0;
    if (activePresentation && activePresentation.conversionFactor) {
      return parsedQty * activePresentation.conversionFactor;
    }
    return parsedQty;
  }, [quantity, activePresentation]);

  const lotEnabled = useLot || Boolean(product?.trackLots);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quantity || Number(quantity) <= 0) return;

    setLoading(true);

    try {
      let finalLotNumber: string | null = null;
      let finalExpDate: string | null = null;
      let finalMfgDate: string | null = null;

      if (lotEnabled) {
        if (selectedLotId !== "AUTO_NEW" && selectedLotId !== "") {
          const existingLot = lots.find((l) => l.idTemp === selectedLotId);
          if (existingLot) {
            finalLotNumber = existingLot.lotNumber;
            finalExpDate = existingLot.expirationDate ?? null;
            finalMfgDate = existingLot.manufactureDate ?? null;
          }
        } else {
          finalLotNumber = customLotNumber.trim();
          if (!finalLotNumber) {
            const prefix =
              reason === InventoryMovementReason.PRODUCTION ? "PROD" : "REC";
            const dateTag = todayStr.replace(/-/g, "");
            const randomHash = Math.random()
              .toString(36)
              .substring(2, 5)
              .toUpperCase();
            finalLotNumber = `${prefix}-${dateTag}-${randomHash}`;
          }
          finalExpDate = expirationDate || null;
          finalMfgDate = manufactureDate || null;
        }
      }

      const isUsingPresentation = Boolean(selectedPresentationId);

      const input: ReceiveStockInput = {
        businessId,
        inventoryProductIdTemp,
        locationIdTemp,
        reason,
        presentationIdTemp: isUsingPresentation ? selectedPresentationId : null,
        presentationQuantity: isUsingPresentation ? Number(quantity) : null,
        quantityBase: calculatedBaseQuantity,
        unitCost: null,
        lotNumber: finalLotNumber,
        expirationDate: finalExpDate,
        manufactureDate: finalMfgDate,
        referenceType: null,
        referenceIdTemp: null,
        notes: null,
      };

      await inventoryStockOrchestrator.receive(input);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error al registrar entrada:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Header denso */}
        <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Cargar Stock / Producción
            </h2>
            {product && (
              <p className="text-xs text-slate-500 font-medium">
                Producto:{" "}
                <span className="text-slate-900 dark:text-slate-100 font-semibold">
                  {product.name}
                </span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Motivo de ingreso */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Operación
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReason(InventoryMovementReason.PRODUCTION)}
                className={`rounded-lg p-2 text-xs font-semibold border transition-colors ${
                  reason === InventoryMovementReason.PRODUCTION
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                🍳 Producción Propia
              </button>
              <button
                type="button"
                onClick={() => setReason(InventoryMovementReason.RECEIPT)}
                className={`rounded-lg p-2 text-xs font-semibold border transition-colors ${
                  reason === InventoryMovementReason.RECEIPT
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                📦 Recepción / Compra
              </button>
            </div>
          </div>

          {/* Cantidad + Presentación */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Cantidad a ingresar *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ej: 50"
                required
                autoFocus
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              {presentations.length > 0 && (
                <select
                  value={selectedPresentationId}
                  onChange={(e) => setSelectedPresentationId(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Unidad base</option>
                  {presentations.map((p) => (
                    <option key={p.idTemp} value={p.idTemp}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Feedback rápido de conversión si aplica */}
            {activePresentation && quantity && (
              <p className="mt-1 text-[11px] text-slate-500 text-right">
                ={" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  {calculatedBaseQuantity}
                </strong>{" "}
                en unidad base
              </p>
            )}
          </div>

          {/* Sección Lotes */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30">
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lotEnabled}
                  disabled={Boolean(product?.trackLots)}
                  onChange={(e) => setUseLot(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 shrink-0"
                />
                <span>
                  Asignar Lote y Vencimiento
                  {product?.trackLots && (
                    <span className="ml-1 text-[10px] text-amber-600 font-normal">
                      (Requerido)
                    </span>
                  )}
                </span>
              </label>

              {lotEnabled && lots.length > 0 && (
                <div className="pl-6">
                  <select
                    value={selectedLotId}
                    onChange={(e) => setSelectedLotId(e.target.value)}
                    className="w-full text-[11px] rounded border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="AUTO_NEW">+ Nuevo lote</option>
                    <optgroup label="Lotes existentes">
                      {lots.map((l) => (
                        <option key={l.idTemp} value={l.idTemp}>
                          {l.lotNumber}{" "}
                          {l.expirationDate
                            ? `(Vence: ${l.expirationDate})`
                            : ""}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}
            </div>

            {lotEnabled && (
              <div className="space-y-2 pt-2.5 mt-2 border-t border-slate-200 dark:border-slate-700/60">
                {selectedLotId === "AUTO_NEW" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                          Fecha Elaboración
                        </label>
                        <input
                          type="date"
                          value={manufactureDate}
                          onChange={(e) => setManufactureDate(e.target.value)}
                          className="w-full rounded border border-slate-300 p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                          Fecha Vencimiento
                        </label>
                        <input
                          type="date"
                          value={expirationDate}
                          onChange={(e) => setExpirationDate(e.target.value)}
                          className="w-full rounded border border-slate-300 p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={customLotNumber}
                        onChange={(e) => setCustomLotNumber(e.target.value)}
                        placeholder="Código de lote (Opcional, autogenerado si se vacía)"
                        className="w-full rounded border border-slate-200 bg-white p-1.5 text-[11px] text-slate-700 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer de Acciones */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !quantity || Number(quantity) <= 0}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Guardando..." : "Confirmar e Ingresar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
