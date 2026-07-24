"use client";

import { useMemo, useState } from "react";
import { Lock, RefreshCw } from "lucide-react";
import { useCashRegister } from "../hooks/useCashRegister";
import { CashRegisterHeader } from "./CashRegisterHeader";
import { CashRegisterMetrics } from "./CashRegisterMetrics";
import { CashRegisterMovementsTable } from "./CashRegisterMovementsTable";
import { CloseTurnModal } from "./CloseTurnModal";
import { CashMovementModal } from "./CashMovementModal";
import { OpenTurnModal } from "./OpenTurnModal";
import {
  FinancialMovementType,
  PaymentMethodTypeFinancial,
} from "@/mini-back/shared/enums/financial-movement-status.enum";
import { cashRegisterOrchestrator } from "@/mini-back/orchestrator/cash-register.orchestrator";
import { useAuthStore } from "@/features/auth/store/authStore";

interface Props {
  businessId: string;
  userId?: string; // Opcional si lo obtenés de contexto/sesión
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  QR: "Cobro QR",
  DEBIT_CARD: "Tarjeta Débito",
  CREDIT_CARD: "Tarjeta Crédito",
  MERCADO_PAGO: "Mercado Pago",
  ACCOUNT: "Cuenta Corriente",
  OTHER: "Otro",
};

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  SALE: "Venta",
  INCOME: "Ingreso Manual",
  EXPENSE: "Egreso / Gasto",
  REFUND: "Devolución",
};

export default function CashRegisterPage({ businessId }: Props) {
  const { activeTurn, movements, totals, isLoading } =
    useCashRegister(businessId);
  const { user } = useAuthStore();

  const [isOpenTurnOpen, setIsOpenTurnOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isCloseTurnOpen, setIsCloseTurnOpen] = useState(false);

  const initialCash = activeTurn?.openingAmount || 0;

  const expectedCashInDrawer = useMemo(() => {
    return initialCash + totals.cash;
  }, [initialCash, totals.cash]);

  // Handler: Abrir Turno
  const handleOpenTurn = async (openingAmount: number) => {
    if(user?.id) {
      await cashRegisterOrchestrator.openCashRegister({
        businessId,
        userId: user?.id,
        openingAmount,
        openingNotes: "",
      });

    }
  };

  // Handler: Ingreso Manual
  const handleIncome = async (data: {
    amount: number;
    paymentMethod: PaymentMethodTypeFinancial;
    description: string;
    notes?: string;
  }) => {
    if(user?.id && activeTurn?.clientTurnId){
      await cashRegisterOrchestrator.processIncomeMovement({
        businessId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        description: data.description,
        notes: data.notes,
        approvedByUserId: user?.id,
        userId: user?.id,
        
      });

    }
  };

  // Handler: Egreso Manual
  const handleExpense = async (data: {
    amount: number;
    paymentMethod: PaymentMethodTypeFinancial;
    description: string;
    notes?: string;
  }) => {
    if(user?.id && activeTurn?.clientTurnId) {
      await cashRegisterOrchestrator.processExpenseMovement({
        businessId,
        userId: user.id,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        description: data.description,
        notes: data.notes,
        approvedByUserId: user?.id,
      });

    }
  };

  // Handler: Cerrar Turno
  const handleCloseTurn = async (data: {
    declaredCash: number;
    difference: number;
    closingNotes?: string;
  }) => {
    if (!activeTurn?.id) return;

    if(user?.id) {

      await cashRegisterOrchestrator.closeCashRegister({
        businessId,
        userId: user.id,
        declaredClosingAmount: data.declaredCash,
      });
    }

  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
        <span className="text-sm font-medium">Cargando estado de caja...</span>
      </div>
    );
  }

  // ESTADO: CAJA CERRADA
  if (!activeTurn) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-5 p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-amber-600 shadow-xs">
          <Lock className="h-10 w-10" />
        </div>

        <div className="max-w-md text-center">
          <h2 className="text-2xl font-black text-slate-800">
            La caja está cerrada
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Abrí un nuevo turno declarando el monto inicial (cambio) para
            empezar a operar.
          </p>
        </div>

        <button
          onClick={() => setIsOpenTurnOpen(true)}
          className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
        >
          Abrir Turno de Caja
        </button>

        {/* Modal de Apertura de Caja */}
        <OpenTurnModal
          isOpen={isOpenTurnOpen}
          onClose={() => setIsOpenTurnOpen(false)}
          onConfirmOpen={handleOpenTurn}
        />
      </div>
    );
  }

  // ESTADO: CAJA ABIERTA
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-6">
      <CashRegisterHeader
        initialCash={initialCash}
        activeTurn={{
          openingDate: activeTurn.openingDate,
          createdAt: activeTurn.createdAt,
        }}
        onOpenIncomeModal={() => setIsIncomeOpen(true)}
        onOpenExpenseModal={() => setIsExpenseOpen(true)}
        onOpenCloseTurnModal={() => setIsCloseTurnOpen(true)}
      />

      <CashRegisterMetrics
        expectedCashInDrawer={expectedCashInDrawer}
        initialCash={initialCash}
        totals={totals}
      />

      <CashRegisterMovementsTable
        movements={movements}
        movementTypeLabels={MOVEMENT_TYPE_LABELS}
        paymentMethodLabels={PAYMENT_METHOD_LABELS}
      />

      {/* Modal Ingreso */}
      <CashMovementModal
        isOpen={isIncomeOpen}
        type={FinancialMovementType.INCOME}
        onClose={() => setIsIncomeOpen(false)}
        onSubmit={handleIncome}
      />

      {/* Modal Egreso */}
      <CashMovementModal
        isOpen={isExpenseOpen}
        type={FinancialMovementType.EXPENSE}
        onClose={() => setIsExpenseOpen(false)}
        onSubmit={handleExpense}
      />

      {/* Modal Cierre */}
      <CloseTurnModal
        isOpen={isCloseTurnOpen}
        expectedCash={expectedCashInDrawer}
        onClose={() => setIsCloseTurnOpen(false)}
        onConfirmClose={handleCloseTurn}
      />
    </div>
  );
}
