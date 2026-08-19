"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminSales } from "@/mini-back/core/admin-core/domain/sales/admin-sales";
import { GetAdminSalesInput } from "@/mini-back/core/admin-core/input/sales/get-admin-sales.input";
import { AdminSalesOrchestrator } from "@/mini-back/orchestrator/admin-sales-orchestrator";

interface UseAdminSalesParams {
  businessId: string;
  from: Date;
  to: Date;
}

interface UseAdminSalesResult {
  data: AdminSales | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const orchestrator = new AdminSalesOrchestrator();

export function useAdminSales({
  businessId,
  from,
  to,
}: UseAdminSalesParams): UseAdminSalesResult {
  const [data, setData] =
    useState<AdminSales | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<Error | null>(null);

  const fetchSales = useCallback(async () => {
    if (!businessId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const input: GetAdminSalesInput = {
        businessId,
        from,
        to,
      };

      const result =
        await orchestrator.execute(input);

      setData(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error
          : new Error(
              "No se pudo obtener la información de ventas.",
            ),
      );
    } finally {
      setLoading(false);
    }
  }, [businessId, from, to]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    data,
    loading,
    error,
    refetch: fetchSales,
  };
}