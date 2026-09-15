import { useAuthStore } from "@/features/auth/store/authStore";
import { useCallback, useEffect, useState } from "react";
import {
  FinancialMovementType,
  PaymentMethodTypeFinancial,
} from "@/mini-back/shared/enums/financial-movement-status.enum";
import { Lock, RefreshCw } from "lucide-react";
import { CashRegisterHeader } from "../components/CashRegisterHeader";
import { CashRegisterMetrics } from "../components/CashRegisterMetrics";
import { CashRegisterMovementsTable } from "../components/CashRegisterMovementsTable";
import { CashMovementModal } from "../components/CashMovementModal";
import { CloseTurnModal } from "../components/CloseTurnModal";
import { financialMovementOrchestrator } from "@/mini-back/orchestrator/financial-movement-orchestrator";
import { OpenTurnModal } from "../components/OpenTurnModal";
import { cashRegisterTurnOrchestrator } from "@/mini-back/orchestrator/cash-register.orchestrator";
import { CashRegisterOrchestrator } from "@/mini-back/orchestrator/cash-register/cash-register-orchestrator";
import { CashRegister } from "@/mini-back/core/cash-register-core/public";
import { useCashRegisterTurn } from "../hooks/useCashRegisterTurn";
import { useCashRegisterTurnStatus } from "../hooks/useCashRegisterTurnStatus";

interface Props {
  businessId: string;
  userId?: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  QR: "Cobro QR",
  DEBIT_CARD: "Tarjeta Débito",
  CREDIT_CARD: "Tarjeta Crédito",
  ACCOUNT: "Cuenta Corriente",
  OTHER: "Otro",
};

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  SALE: "Venta",
  INCOME: "Ingreso Manual",
  EXPENSE: "Egreso / Gasto",
  REFUND: "Devolución",
};

export default function CurrentCashRegisterTurnPage({ businessId }: Props) {
  const {
    activeTurn,
    movements,
    totals,
    isLoading: isLoadingData,
  } = useCashRegisterTurn(businessId);

  const { user } = useAuthStore();

  const { isOpen, isLoading: isCheckingStatus } =
    useCashRegisterTurnStatus(businessId);

  const [isOpenTurnOpen, setIsOpenTurnOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isCloseTurnOpen, setIsCloseTurnOpen] = useState(false);

  // Cajas físicas activas disponibles para abrir un turno.
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);

  const initialCash = activeTurn?.openingAmount || 0;

  const loadCashRegisters = useCallback(async () => {
    if (!businessId) {
      setCashRegisters([]);
      return;
    }

    try {
      const orchestrator = new CashRegisterOrchestrator();

      const registers =
        await orchestrator.findActiveByBusinessId(businessId);

      setCashRegisters(registers);
    } catch (error) {
      console.error("Error loading cash registers:", error);
      setCashRegisters([]);
    }
  }, [businessId]);

  useEffect(() => {
    // Solo necesitamos cargar las cajas cuando
    // estamos en estado de caja cerrada.
    if (!isOpen) {
      void loadCashRegisters();
    }
  }, [isOpen, loadCashRegisters]);

  // Handler: Ingreso Manual
  const handleIncome = async (data: {
    amount: number;
    paymentMethod: PaymentMethodTypeFinancial;
    description: string;
    notes?: string;
  }) => {
    if (user?.id && activeTurn?.idTemp) {
      await financialMovementOrchestrator.processIncomeMovement({
        businessId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        description: data.description,
        notes: data.notes,
        approvedByUserId: user.id,
        userId: user.id,
        idTemp: activeTurn.idTemp,
        treasuryAccountId: activeTurn.treasuryAccountId,
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
    if (user?.id && activeTurn?.idTemp) {
      await financialMovementOrchestrator.processExpenseMovement({
        businessId,
        userId: user.id,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        description: data.description,
        notes: data.notes,
        idTemp: activeTurn.idTemp,
        approvedByUserId: user.id,
        treasuryAccountId: activeTurn.treasuryAccountId,
      });
    }
  };

  // Handler: Abrir Turno
  const handleOpenTurn = async (
    openingAmount: number,
    cashRegisterId: string,
    defaultTreasuryAccountId: string,
    openingNotes: string,
  ) => {
    if (!user?.id) return;

    await cashRegisterTurnOrchestrator.openCashRegisterTurn({
      businessId,
      userId: user.id,
      openingAmount,
      treasuryAccountId: defaultTreasuryAccountId,
      cashRegisterId,
      openingNotes,
    });

    setIsOpenTurnOpen(false);
  };

  // Handler: Cerrar Turno
  //
  // En esta etapa solamente enviamos el efectivo
  // contado por el usuario.
  //
  // El efectivo esperado y la diferencia serán
  // determinados posteriormente por el flujo de cierre,
  // utilizando Tesorería como fuente de verdad.
  const handleCloseTurn = async (data: {
    declaredCash: number;
    closingNotes?: string;
  }) => {
    if (!activeTurn?.idTemp) return;
    if (!user?.id) return;

    await cashRegisterTurnOrchestrator.closeCashRegisterTurn({
      businessId,
      userId: user.id,
      declaredClosingAmount: data.declaredCash,
    });
  };

  if (isCheckingStatus || (isOpen && isLoadingData)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
        <span className="text-sm font-medium">
          Cargando estado de caja...
        </span>
      </div>
    );
  }

  // ESTADO: CAJA CERRADA
  if (!isOpen) {
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

        <OpenTurnModal
          isOpen={isOpenTurnOpen}
          onClose={() => setIsOpenTurnOpen(false)}
          onConfirmOpen={handleOpenTurn}
          cashRegisters={cashRegisters}
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
          openingDate: activeTurn?.openingDate,
          createdAt: activeTurn?.createdAt,
        }}
        onOpenIncomeModal={() => setIsIncomeOpen(true)}
        onOpenExpenseModal={() => setIsExpenseOpen(true)}
        onOpenCloseTurnModal={() => setIsCloseTurnOpen(true)}
      />

      <CashRegisterMetrics
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
        onClose={() => setIsCloseTurnOpen(false)}
        onConfirmClose={handleCloseTurn}
      />
    </div>
  );
}