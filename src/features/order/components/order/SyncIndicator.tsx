"use client";
import { getSyncQueueWorker } from "@/mini-back/infrastructure/network/SyncQueueWorker";
// src/components/SyncIndicator.tsx
import { Loader2, CloudUpload, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function SyncIndicator() {
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSyncClick = async () => {
    setSyncing(true);
    setSuccess(false);

    try {
        console.log("SyncIndicator: Iniciando sincronización manual de todas las órdenes pendientes...");
      await getSyncQueueWorker().forceManualSyncAll();

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
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
        group relative overflow-hidden
        flex items-center justify-center gap-2
        min-w-[260px]
        px-5 py-3
        rounded-2xl
        font-medium text-sm
        transition-all duration-300
        shadow-md
        border
        ${
          syncing
            ? "bg-blue-600 border-blue-500 text-white"
            : success
            ? "bg-emerald-600 border-emerald-500 text-white"
            : "bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:scale-[1.02]"
        }
        disabled:cursor-not-allowed disabled:opacity-90
      `}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <div className="relative flex items-center gap-2">
        {syncing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sincronizando órdenes...</span>
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Sincronizado correctamente</span>
          </>
        ) : (
          <>
            <CloudUpload className="w-4 h-4" />
            <span>Sincronizar Mostrador</span>
          </>
        )}
      </div>
    </button>
  );
}