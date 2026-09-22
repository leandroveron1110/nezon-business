"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TreasuryAccount } from "@/mini-back/core/treasury-core/domain/treasury-account/treasury-account";
import { TreasuryAccountOrchestrator } from "@/mini-back/orchestrator/treasury-account/treasury-account-orchestrator";
import { getTreasuryAccountSyncWorker } from "@/mini-back/infrastructure/workers/treasury-account/treasury-account.worker";

export function useTreasuryAccounts(businessId: string) {
  const [accounts, setAccounts] = useState<TreasuryAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    if (!businessId) {
      setAccounts([]);
      return;
    }

    try {
      const orchestrator = new TreasuryAccountOrchestrator();
      const treasuryAccounts = await orchestrator.findByBusinessId(businessId);

      const recalculatedAccounts = await Promise.all(
        treasuryAccounts.map(
          async (account) =>
            await orchestrator.recalculateBalance(businessId, account.idTemp),
        ),
      );

      setAccounts(recalculatedAccounts);
    } catch (error) {
      console.error("Error loading treasury accounts:", error);
    }
  }, [businessId]);

  useEffect(() => {
    const initializeTreasury = async () => {
      if (!businessId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const worker = getTreasuryAccountSyncWorker();
        await worker.processQueue(businessId);
        await loadAccounts();
      } catch (error) {
        console.error("Error initializing treasury:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeTreasury();
  }, [businessId, loadAccounts]);

  const activeAccounts = useMemo(
    () => accounts.filter((account) => account.isActive),
    [accounts],
  );

  const balancesByCurrency = useMemo(() => {
    return accounts.reduce<Record<string, number>>((acc, account) => {
      const currency = account.currency || "ARS";
      const balance = Number(account.currentBalance) || 0;
      acc[currency] = (acc[currency] || 0) + balance;
      return acc;
    }, {});
  }, [accounts]);

  return {
    accounts,
    activeAccounts,
    balancesByCurrency,
    isLoading,
    reloadAccounts: loadAccounts,
  };
}
