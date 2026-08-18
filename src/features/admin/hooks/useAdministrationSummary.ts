import { useState, useEffect } from "react";
import { AdministrationSummary } from "@/mini-back/core/admin-core/public";
import { AdministrationOrchestrator } from "@/mini-back/orchestrator/administration-orchestrator";

export function useAdministrationSummary(from: Date, to: Date, businessId: string) {
  const [summary, setSummary] = useState<AdministrationSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        // Instanciamos tu orquestador que ya conoce 'db'
        const orchestrator = new AdministrationOrchestrator();
        const data = await orchestrator.getGeneralSummary({ businessId, from, to });
        setSummary(data);
      } catch (err) {
        console.error("Error al cargar el resumen de administración:", err);
        setError("No se pudieron cargar los datos analíticos.");
      } finally {
        setLoading(false);
      }
    }

    if (businessId) {
      loadSummary();
    }
  }, [businessId, from, to]);

  return { summary, loading, error };
}