"use client";

import { useConnectivity } from "@/lib/hooks/useConnectivity";
import {
  getSyncQueueWorker,
  SyncResult,
} from "@/mini-back/infrastructure/network/SyncQueueWorker";
import { initSchedulers } from "@/mini-back/infrastructure/workers/delivery/delivery.worker";
import {
  Loader2,
  CloudUpload,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
} from "lucide-react";
import { useState } from "react";

type SyncUIStatus =
  | "idle"
  | "syncing"
  | "success"
  | "partial_error"
  | "offline";

export function SyncIndicator() {
  const { isOnline, isOffline, isChecking } = useConnectivity();
  const [syncStatus, setSyncStatus] = useState<SyncUIStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSyncClick = async () => {
    // Si no hay red/servidor activo, abortamos la acción manual
    if (!isOnline) return;

    setSyncStatus("syncing");
    setErrorMessage("");

    try {
      const result: SyncResult =
        await getSyncQueueWorker().forceManualSyncAll();
      initSchedulers(); // Reiniciamos schedulers del DeliveryWorker tras la sincronización

      if (result.success) {
        setSyncStatus("success");
        setTimeout(() => setSyncStatus("idle"), 3000);
      } else {
        if (result.status === "OFFLINE" || result.status === "SERVER_DOWN") {
          setSyncStatus("offline");
          setErrorMessage("Sin comunicación con el servidor");
        } else {
          setSyncStatus("partial_error");
          setErrorMessage(
            `Quedaron ${result.pendingCount ?? "algunas"} órdenes sin subir.`
          );
        }
        setTimeout(() => setSyncStatus("idle"), 5000);
      }
    } catch (error) {
      setSyncStatus("partial_error");
      setErrorMessage("Error inesperado en la sincronización.");
      setTimeout(() => setSyncStatus("idle"), 4000);
    }
  };

  // Botón deshabilitado si no estamos 100% online o si ya se está ejecutando una sincronización
  const isButtonDisabled = !isOnline || syncStatus === "syncing";

  // Mapeo dinámico de estilos Tailwind según el estado de conectividad real
  const getButtonStyles = () => {
    if (isOffline) {
      return "bg-rose-50 border-rose-200 text-rose-600 opacity-80 cursor-not-allowed";
    }
    if (isChecking) {
      return "bg-amber-50 border-amber-200 text-amber-700 animate-pulse cursor-wait";
    }

    switch (syncStatus) {
      case "syncing":
        return "bg-blue-50 border-blue-200 text-blue-600 shadow-inner animate-pulse";
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-600";
      case "partial_error":
        return "bg-amber-50 border-amber-200 text-amber-700 font-medium";
      default:
        return "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 shadow-sm active:scale-98";
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={handleSyncClick}
        disabled={isButtonDisabled}
        className={`
          flex items-center justify-center gap-2
          px-3.5 py-2 rounded-xl
          font-semibold text-xs md:text-sm
          border transition-all duration-200
          disabled:cursor-not-allowed select-none
          ${getButtonStyles()}
        `}
      >
        {/* Estado 1: Sin conexión */}
        {isOffline && (
          <>
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <span>Sin Conexión</span>
          </>
        )}
      </button>

      {isOnline && !isChecking && errorMessage && (
        <span className="text-[10px] text-amber-600 font-medium tracking-wide animate-fadeIn px-1">
          {errorMessage}
        </span>
      )}
    </div>
  );
}