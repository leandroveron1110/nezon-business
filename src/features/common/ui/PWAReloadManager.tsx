"use client";

import { useEffect } from "react";

export function PWAReloadManager() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Escucha cuando un nuevo Service Worker toma el control de la página
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        // console.log("🚀 Nueva versión detectada en Vercel. Recargando aplicación de forma limpia...");
        // Forzar reload saltando el caché del navegador
        window.location.reload();
      });
    }
  }, []);

  return null;
}