"use client";
// src/components/SyncIndicator.tsx
import { getSyncQueueWorker } from "@/mini-back/infrastructure/network/SyncQueueWorker";
import { Loader2, CloudUpload, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function SyncIndicator() {
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSyncClick = async () => {
    setSyncing(true);
    setSuccess(false);

    try {
      await getSyncQueueWorker().forceManualSyncAll();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Hubo un problema al sincronizar algunas órdenes.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      onClick={handleSyncClick}
      disabled={syncing}
      className={`
        flex items-center justify-center gap-2
        px-3.5 py-2 rounded-xl
        font-semibold text-xs md:text-sm
        border transition-all duration-200
        disabled:cursor-not-allowed select-none
        ${
          syncing
            ? "bg-blue-50 border-blue-200 text-blue-600 shadow-inner"
            : success
            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800 shadow-sm active:scale-98"
        }
      `}
    >
      {syncing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
          <span>Sincronizando...</span>
        </>
      ) : success ? (
        <>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Sincronizado</span>
        </>
      ) : (
        <>
          <CloudUpload className="w-4 h-4 flex-shrink-0" />
          {/* Oculta texto secundario en pantallas muy chicas para mantener la armonía */}
          <span className="inline-block">Sincronizar</span>
        </>
      )}
    </button>
  );
}