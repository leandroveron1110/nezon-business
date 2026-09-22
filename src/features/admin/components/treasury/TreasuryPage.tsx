"use client";

import { useCallback, useState } from "react";

import { CreateTreasuryAccount } from "@/features/admin/components/treasury/components/CreateTreasuryAccount";
import { TransferTreasuryModal } from "./components/TransferTreasuryModal";

import { useTreasuryAccounts } from "./hooks/useTreasuryAccounts";
import { useTreasuryMovements } from "./hooks/useTreasuryMovements";

import { TreasuryHeader } from "./components/TreasuryHeader";
import { TreasurySummary } from "./components/TreasurySummary";
import { TreasuryAccountsList } from "./components/TreasuryAccountsList";
import { TreasurySkeleton } from "./components/TreasurySkeleton";
import { TreasuryMovementModal } from "./components/TreasuryMovementModal";
import { TreasuryMovements } from "./components/TreasuryMovements";

import {
  FinancialMovementType,
  PaymentMethodTypeFinancial,
} from "@/mini-back/shared/enums/financial-movement-status.enum";

import { financialMovementOrchestrator } from "@/mini-back/orchestrator/financial-movement-orchestrator";

interface TreasuryPageProps {
  businessId: string;
}

export default function TreasuryPage({ businessId }: TreasuryPageProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  // ---------------------------------------------------------
  // CUENTAS
  // ---------------------------------------------------------

  const {
    accounts,
    activeAccounts,
    balancesByCurrency,
    isLoading: isAccountsLoading,
    reloadAccounts,
  } = useTreasuryAccounts(businessId);

  // ---------------------------------------------------------
  // MOVIMIENTOS
  // ---------------------------------------------------------

  const { movements, isLoading: isMovementsLoading } =
    useTreasuryMovements(businessId);

  // ---------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------

  const handleTransferred = useCallback(async () => {
    await reloadAccounts();

    setIsTransferOpen(false);
  }, [reloadAccounts]);

  const handleAccountCreated = useCallback(async () => {
    await reloadAccounts();

    setIsCreateOpen(false);
  }, [reloadAccounts]);

  const handleMovementCreated = useCallback(async () => {
    await reloadAccounts();
  }, [reloadAccounts]);

  // ---------------------------------------------------------
  // INGRESO MANUAL
  // ---------------------------------------------------------

  const handleIncome = async (data: {
    type: FinancialMovementType;
    amount: number;
    treasuryAccountIdTemp: string;
    paymentMethod: PaymentMethodTypeFinancial;
    description: string;
    notes?: string;
  }) => {
    await financialMovementOrchestrator.processIncomeMovement({
      idTemp: crypto.randomUUID(),

      businessId,

      userId: "user_system",
      approvedByUserId: "user_system",

      amount: data.amount,

      treasuryAccountIdTemp: data.treasuryAccountIdTemp,

      paymentMethod: data.paymentMethod,

      description: data.description,

      notes: data.notes,
    });

    await handleMovementCreated();
  };

  // ---------------------------------------------------------
  // EGRESO MANUAL
  // ---------------------------------------------------------

  const handleExpense = async (data: {
    type: FinancialMovementType;
    amount: number;
    treasuryAccountIdTemp: string;
    paymentMethod: PaymentMethodTypeFinancial;
    description: string;
    notes?: string;
  }) => {
    await financialMovementOrchestrator.processExpenseMovement({
      idTemp: crypto.randomUUID(),

      businessId,

      userId: "user_system",
      approvedByUserId: "user_system",

      amount: data.amount,

      treasuryAccountIdTemp: data.treasuryAccountIdTemp,

      paymentMethod: data.paymentMethod,

      description: data.description,

      notes: data.notes,
    });

    await handleMovementCreated();
  };

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (isAccountsLoading) {
    return <TreasurySkeleton />;
  }

  // ---------------------------------------------------------
  // CUENTAS PARA EL MODAL
  // ---------------------------------------------------------

  const treasuryAccountOptions = accounts.map((account) => ({
    idTemp: account.idTemp,
    balance: account.currentBalance,
    name: account.name,
    currency: account.currency,
    type: account.type,
  }));

  // ---------------------------------------------------------
  // VIEW
  // ---------------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
      {/* Header */}

      <TreasuryHeader
        onOpenCreateAccount={() => setIsCreateOpen(true)}
        onOpenExpenseModal={() => setIsExpenseOpen(true)}
        onOpenIncomeModal={() => setIsIncomeOpen(true)}
        onOpenTransferModal={() => setIsTransferOpen(true)}
      />

      {/* Crear cuenta */}

      {isCreateOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <CreateTreasuryAccount
            businessId={businessId}
            onCreated={handleAccountCreated}
            onCancel={() => setIsCreateOpen(false)}
          />
        </div>
      )}

      {/* Resumen */}

      <TreasurySummary
        balancesByCurrency={balancesByCurrency}
        activeAccountsCount={activeAccounts.length}
        totalAccountsCount={accounts.length}
      />

      {/* Cuentas */}

      <TreasuryAccountsList
        accounts={accounts}
        onCreateAccountClick={() => setIsCreateOpen(true)}
      />

      {/* Movimientos */}

      <TreasuryMovements movements={movements} isLoading={isMovementsLoading} />

      {/* -------------------------------------------------- */}
      {/* INGRESO */}
      {/* -------------------------------------------------- */}

      <TreasuryMovementModal
        isOpen={isIncomeOpen}
        type={FinancialMovementType.INCOME}
        accounts={treasuryAccountOptions}
        onClose={() => setIsIncomeOpen(false)}
        onSubmit={handleIncome}
      />

      {/* -------------------------------------------------- */}
      {/* EGRESO */}
      {/* -------------------------------------------------- */}

      <TreasuryMovementModal
        isOpen={isExpenseOpen}
        type={FinancialMovementType.EXPENSE}
        accounts={treasuryAccountOptions}
        onClose={() => setIsExpenseOpen(false)}
        onSubmit={handleExpense}
      />

      {/* -------------------------------------------------- */}
      {/* TRANSFERENCIA */}
      {/* -------------------------------------------------- */}

      {isTransferOpen && (
        <TransferTreasuryModal
          businessId={businessId}
          accounts={activeAccounts}
          onClose={() => setIsTransferOpen(false)}
          onTransferred={handleTransferred}
        />
      )}
    </div>
  );
}
