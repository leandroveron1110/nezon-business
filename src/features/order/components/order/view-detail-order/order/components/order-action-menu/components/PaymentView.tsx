import { Check, CreditCard, Loader2, Banknote, UserCheck, QrCode } from "lucide-react";
import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";
import { MenuHeader } from "./MenuHeader";

export const PAYMENT_METHODS = [
  { value: PaymentMethodTypeFinancial.CASH, label: "Efectivo", icon: <Banknote size={16} /> },
  { value: PaymentMethodTypeFinancial.TRANSFER, label: "Transferencia", icon: <CreditCard size={16} /> },
  { value: PaymentMethodTypeFinancial.QR, label: "QR / MODO", icon: <QrCode size={16} /> },
  { value: PaymentMethodTypeFinancial.DEBIT_CARD, label: "Débito", icon: <CreditCard size={16} /> },
  { value: PaymentMethodTypeFinancial.CREDIT_CARD, label: "Crédito", icon: <CreditCard size={16} /> },
  { value: PaymentMethodTypeFinancial.ACCOUNT, label: "Cuenta corriente", icon: <UserCheck size={16} /> },
  { value: PaymentMethodTypeFinancial.OTHER, label: "Otro", icon: <CreditCard size={16} /> },
];

interface PaymentViewProps {
  currentMethod: PaymentMethodTypeFinancial;
  isSaving: boolean;
  onBack: () => void;
  onChangeMethod: (method: PaymentMethodTypeFinancial) => void;
  formatPaymentMethod: (method: PaymentMethodTypeFinancial) => string;
}

export function PaymentView({
  currentMethod,
  isSaving,
  onBack,
  onChangeMethod,
  formatPaymentMethod,
}: PaymentViewProps) {
  return (
    <>
      <MenuHeader
        title="Medio de pago"
        icon={<CreditCard size={15} className="text-blue-500" />}
        onBack={onBack}
      />
      <div className="p-2">
        <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">
            Medio actual
          </div>
          <div className="mt-0.5 text-xs font-black text-slate-700">
            {formatPaymentMethod(currentMethod)}
          </div>
        </div>

        <div className="space-y-1">
          {PAYMENT_METHODS.map((method) => {
            const isCurrent = currentMethod === method.value;
            return (
              <button
                key={method.value}
                type="button"
                disabled={isSaving || isCurrent}
                onClick={() => onChangeMethod(method.value)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                  isCurrent ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                } disabled:cursor-default`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isCurrent ? "text-blue-500" : "text-slate-400"}>
                    {method.icon}
                  </span>
                  <span className="text-xs font-bold">{method.label}</span>
                </div>
                {isCurrent && <Check size={15} className="text-blue-600" />}
                {isSaving && !isCurrent && (
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}