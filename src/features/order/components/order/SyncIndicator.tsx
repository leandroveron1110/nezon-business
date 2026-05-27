"use client";
import { getSyncQueueWorker, SyncResult } from "@/mini-back/infrastructure/network/SyncQueueWorker";
import { Loader2, CloudUpload, CheckCircle2, AlertTriangle, CloudOff } from "lucide-react";
import { useState } from "react";

type SyncUIStatus = "idle" | "syncing" | "success" | "partial_error" | "offline";

export function SyncIndicator() {
  const [status, setStatus] = useState<SyncUIStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSyncClick = async () => {
    setStatus("syncing");
    setErrorMessage("");

    try {
      const result: SyncResult = await getSyncQueueWorker().forceManualSyncAll();

      if (result.success) {
        setStatus("success");
        // Volver al estado inicial tras unos segundos de feedback positivo
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        if (result.status === "OFFLINE" || result.status === "SERVER_DOWN") {
          setStatus("offline");
          setErrorMessage(result.status === "OFFLINE" ? "Sin conexión a internet" : "Servidor no disponible");
        } else {
          setStatus("partial_error");
          setErrorMessage(`Quedaron ${result.pendingCount ?? 'algunas'} órdenes sin subir.`);
        }
        setTimeout(() => setStatus("idle"), 5000); // feedback extendido para el error
      }
    } catch (error) {
      setStatus("partial_error");
      setErrorMessage("Error crítico inesperado en la sincronización.");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  // Mapeo dinámico de estilos Tailwind según el estado real
  const buttonStyles = {
    idle: "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 shadow-sm active:scale-98",
    syncing: "bg-blue-50 border-blue-200 text-blue-600 shadow-inner animate-pulse",
    success: "bg-emerald-50 border-emerald-200 text-emerald-600",
    partial_error: "bg-amber-50 border-amber-200 text-amber-700 font-medium",
    offline: "bg-rose-50 border-rose-200 text-rose-600 cursor-not-allowed"
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={handleSyncClick}
        disabled={status === "syncing" || status === "offline"}
        className={`
          flex items-center justify-center gap-2
          px-3.5 py-2 rounded-xl
          font-semibold text-xs md:text-sm
          border transition-all duration-200
          disabled:cursor-not-allowed select-none
          ${buttonStyles[status]}
        `}
      >
        {status === "syncing" && (
          <>
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            <span>Sincronizando...</span>
          </>
        )}
        
        {status === "success" && (
          <>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Sincronizado con éxito</span>
          </>
        )}

        {status === "partial_error" && (
          <>
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Sincronización incompleta</span>
          </>
        )}

        {status === "offline" && (
          <>
            <CloudOff className="w-4 h-4 flex-shrink-0" />
            <span>Modo Offline</span>
          </>
        )}

        {status === "idle" && (
          <>
            <CloudUpload className="w-4 h-4 flex-shrink-0" />
            <span>Sincronizar</span>
          </>
        )}
      </button>

      {/* Subtexto descriptivo de errores si los hubiera */}
      {errorMessage && (
        <span className="text-[10px] text-gray-400 font-medium tracking-wide animate-fadeIn px-1">
          {errorMessage}
        </span>
      )}
    </div>
  );
}