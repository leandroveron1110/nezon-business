"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  Check,
  ChevronDown,
  Landmark,
  Loader2,
  Plus,
  Store,
  Wallet,
  X,
  CreditCard,
  ArrowRight,
} from "lucide-react";

import { CashRegisterOrchestrator } from "@/mini-back/orchestrator/cash-register/cash-register-orchestrator";
import { TreasuryAccountOrchestrator } from "@/mini-back/orchestrator/treasury-account/treasury-account-orchestrator";

import { CashRegister } from "@/mini-back/core/cash-register-core/domain/cash-register/cash-register";
import { TreasuryAccount } from "@/mini-back/core/treasury-core/domain/treasury-account/treasury-account";
import { CashRegisterPaymentMethod } from "@/mini-back/core/cash-register-core/public";
import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";

const cashRegisterOrchestrator = new CashRegisterOrchestrator();
const treasuryAccountOrchestrator = new TreasuryAccountOrchestrator();

interface CashRegisterWithPaymentMethods {
  cashRegister: CashRegister;
  paymentMethods: CashRegisterPaymentMethod[];
}

interface CashRegisterPageProps {
  businessId: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  TRANSFER: "Transferencia",
  CARD: "Tarjeta",
};

type TreasuryAccountType = "CASH" | "BANK" | "DIGITAL_WALLET" | "SAFE_BOX";

const PAYMENT_METHOD_TREASURY_TYPES: Record<string, TreasuryAccountType[]> = {
  TRANSFER: ["DIGITAL_WALLET"],
  CARD: ["BANK"],
};

export default function CashRegisterPage({
  businessId,
}: CashRegisterPageProps) {
  const [registers, setRegisters] = useState<CashRegisterWithPaymentMethods[]>(
    [],
  );
  const [treasuryAccounts, setTreasuryAccounts] = useState<TreasuryAccount[]>(
    [],
  );

  const [name, setName] = useState("");
  const [treasuryAccountId, setTreasuryAccountId] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [configuringRegisterId, setConfiguringRegisterId] = useState<
    string | null
  >(null);
  const [paymentMethod, setPaymentMethod] = useState<
    PaymentMethodTypeFinancial | ""
  >("");
  const [paymentTreasuryAccountId, setPaymentTreasuryAccountId] = useState("");
  const [savingPaymentMethod, setSavingPaymentMethod] = useState(false);

  const compatibleTreasuryAccounts = paymentMethod
    ? treasuryAccounts.filter((account) =>
        PAYMENT_METHOD_TREASURY_TYPES[paymentMethod]?.includes(
          account.type as TreasuryAccountType,
        ),
      )
    : [];

  async function loadData() {
    setLoading(true);
    try {
      const cashRegisters =
        await cashRegisterOrchestrator.findByBusinessId(businessId);
      const accounts =
        await treasuryAccountOrchestrator.findActiveByBusinessId(businessId);

      const registersWithPaymentMethods = await Promise.all(
        cashRegisters.map(async (register) => {
          return cashRegisterOrchestrator.findByIdWithPaymentMethods(
            register.idTemp,
            businessId,
          );
        }),
      );

      setRegisters(registersWithPaymentMethods);
      setTreasuryAccounts(accounts);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [businessId]);

  async function handleCreate() {
    if (!name.trim()) {
      alert("Ingresá un nombre");
      return;
    }

    if (!treasuryAccountId) {
      alert("Seleccioná una cuenta de efectivo");
      return;
    }

    setCreating(true);

    try {
      await cashRegisterOrchestrator.create({
        idTemp: crypto.randomUUID(),
        businessId,
        name: name.trim(),
        defaultTreasuryAccountId: treasuryAccountId,
      });

      setName("");
      setTreasuryAccountId("");
      await loadData();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "No se pudo crear la caja",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(idTemp: string) {
    try {
      await cashRegisterOrchestrator.toggleActive(idTemp, businessId);
      await loadData();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "No se pudo cambiar el estado",
      );
    }
  }

  function openPaymentMethodForm(cashRegisterId: string) {
    setConfiguringRegisterId(cashRegisterId);
    setPaymentMethod("");
    setPaymentTreasuryAccountId("");
  }

  function closePaymentMethodForm() {
    setConfiguringRegisterId(null);
    setPaymentMethod("");
    setPaymentTreasuryAccountId("");
  }

  function handlePaymentMethodChange(value: PaymentMethodTypeFinancial | "") {
    setPaymentMethod(value);

    if (!value) {
      setPaymentTreasuryAccountId("");
      return;
    }

    const compatibleAccounts = treasuryAccounts.filter((account) =>
      PAYMENT_METHOD_TREASURY_TYPES[value]?.includes(
        account.type as TreasuryAccountType,
      ),
    );

    if (compatibleAccounts.length === 1) {
      setPaymentTreasuryAccountId(compatibleAccounts[0].idTemp);
      return;
    }

    setPaymentTreasuryAccountId("");
  }

  async function handleCreatePaymentMethod() {
    if (!configuringRegisterId) return;

    if (!paymentMethod) {
      alert("Seleccioná un medio de pago");
      return;
    }

    if (!paymentTreasuryAccountId) {
      alert("Seleccioná dónde se recibe el dinero");
      return;
    }

    setSavingPaymentMethod(true);

    try {
      await cashRegisterOrchestrator.createPaymentMethod({
        idTemp: crypto.randomUUID(),
        businessId,
        cashRegisterId: configuringRegisterId,
        paymentMethod,
        treasuryAccountId: paymentTreasuryAccountId,
      });

      closePaymentMethodForm();
      await loadData();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo configurar el medio de pago",
      );
    } finally {
      setSavingPaymentMethod(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
        <div className="space-y-2">
          <div className="h-6 w-36 animate-pulse rounded-md bg-slate-200" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-slate-100" />
        </div>
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10">
            <Store className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Cajas físicas
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Configurá los puntos de cobro presenciales y la ruta de sus fondos.
        </p>
      </div>

      {/* FORMULARIO DE CREACIÓN DE CAJA */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-5 flex items-center gap-2 pb-4 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Nueva caja</h2>
            <p className="text-xs text-slate-500">
              Crea un nuevo punto de venta vinculando su efectivo por defecto.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          {/* NOMBRE */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Nombre de la caja <span className="text-emerald-600">*</span>
            </label>
            <div className="relative">
              <Store className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Caja Principal, Mostrador 1"
                disabled={creating}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
              />
            </div>
          </div>

          {/* CUENTA DE EFECTIVO */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Cuenta de efectivo por defecto{" "}
              <span className="text-emerald-600">*</span>
            </label>
            <div className="relative">
              <Banknote className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={treasuryAccountId}
                onChange={(e) => setTreasuryAccountId(e.target.value)}
                disabled={creating}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-9 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
              >
                <option value="">Seleccionar cuenta de tesorería</option>
                {treasuryAccounts
                  .filter((account) => account.type === "CASH")
                  .map((account) => (
                    <option key={account.idTemp} value={account.idTemp}>
                      {account.name}
                    </option>
                  ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* BOTÓN CREAR */}
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !name.trim() || !treasuryAccountId}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>{creating ? "Creando..." : "Crear caja"}</span>
          </button>
        </div>
      </section>

      {/* LISTA DE CAJAS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-slate-900">
            Cajas registradas
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {registers.length} {registers.length === 1 ? "caja" : "cajas"}
          </span>
        </div>

        {registers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs ring-1 ring-slate-200">
              <Store className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No hay cajas físicas
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              Creá tu primera caja para comenzar a procesar ventas presenciales.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {registers.map(({ cashRegister, paymentMethods }) => {
              const cashTreasury = treasuryAccounts.find(
                (account) =>
                  account.idTemp === cashRegister.defaultTreasuryAccountId ||
                  account.id === cashRegister.defaultTreasuryAccountId,
              );

              const isConfiguring =
                configuringRegisterId === cashRegister.idTemp;

              return (
                <div
                  key={cashRegister.idTemp}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300"
                >
                  {/* CABECERA CAJA */}
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200/60">
                        <Store className="h-5 w-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-sm font-bold text-slate-900">
                            {cashRegister.name}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              cashRegister.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                cashRegister.isActive
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {cashRegister.isActive ? "Activa" : "Inactiva"}
                          </span>
                        </div>

                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Banknote className="h-3.5 w-3.5 text-slate-400" />
                          <span>Efectivo:</span>
                          <span className="font-semibold text-slate-700">
                            {cashTreasury?.name ??
                              cashRegister.defaultTreasuryAccountId}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggle(cashRegister.idTemp)}
                      className={`self-start rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition sm:self-auto ${
                        cashRegister.isActive
                          ? "border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {cashRegister.isActive
                        ? "Desactivar caja"
                        : "Activar caja"}
                    </button>
                  </div>

                  {/* SECCIÓN MEDIOS DE PAGO */}
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                    <div className="flex items-center justify-between pb-3">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900">
                          Medios de pago adicionales
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Cuentas de acreditación para pagos no en efectivo.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openPaymentMethodForm(cashRegister.idTemp)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar medio
                      </button>
                    </div>

                    {/* LISTADO DE MEDIOS */}
                    {paymentMethods.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center">
                        <p className="text-xs text-slate-400">
                          No hay medios de pago adicionales asignados a esta
                          caja.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                        {paymentMethods.map((pm) => {
                          const treasuryAccount = treasuryAccounts.find(
                            (acc) =>
                              acc.idTemp === pm.treasuryAccountId ||
                              acc.id === pm.treasuryAccountId,
                          );

                          return (
                            <div
                              key={pm.idTemp}
                              className="flex items-center justify-between px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                  <CreditCard className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-slate-900">
                                    {PAYMENT_METHOD_LABELS[pm.paymentMethod] ??
                                      pm.paymentMethod}
                                  </p>
                                  <p className="flex items-center gap-1 text-[11px] text-slate-500">
                                    <ArrowRight className="h-3 w-3 text-slate-400" />
                                    <span>
                                      {treasuryAccount?.name ??
                                        pm.treasuryAccountId}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  pm.isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {pm.isActive ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* FORMULARIO AGREGAR MEDIO */}
                    {isConfiguring && (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <h5 className="text-xs font-bold text-slate-900">
                            Configurar nuevo medio de pago
                          </h5>
                          <button
                            type="button"
                            onClick={closePaymentMethodForm}
                            disabled={savingPaymentMethod}
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-4 pt-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                          {/* SELECT MEDIO */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                              Medio de pago{" "}
                              <span className="text-emerald-600">*</span>
                            </label>
                            <div className="relative">
                              <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <select
                                value={paymentMethod}
                                onChange={(e) =>
                                  handlePaymentMethodChange(
                                    e.target.value as
                                      | PaymentMethodTypeFinancial
                                      | "",
                                  )
                                }
                                disabled={savingPaymentMethod}
                                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                              >
                                <option value="">Seleccionar medio</option>
                                <option value="TRANSFER">Transferencia</option>
                                <option value="CARD">Tarjeta</option>
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            </div>
                          </div>

                          {/* SELECT CUENTA */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                              Acreditar en{" "}
                              <span className="text-emerald-600">*</span>
                            </label>
                            <div className="relative">
                              <Landmark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <select
                                value={paymentTreasuryAccountId}
                                onChange={(e) =>
                                  setPaymentTreasuryAccountId(e.target.value)
                                }
                                disabled={
                                  savingPaymentMethod ||
                                  !paymentMethod ||
                                  compatibleTreasuryAccounts.length === 0
                                }
                                className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                              >
                                <option value="">
                                  {!paymentMethod
                                    ? "Seleccioná primero el medio"
                                    : compatibleTreasuryAccounts.length === 0
                                      ? "Sin cuentas compatibles"
                                      : "Seleccionar cuenta"}
                                </option>
                                {compatibleTreasuryAccounts.map((acc) => (
                                  <option key={acc.idTemp} value={acc.idTemp}>
                                    {acc.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            </div>
                          </div>

                          {/* BOTÓN GUARDAR */}
                          <button
                            type="button"
                            onClick={handleCreatePaymentMethod}
                            disabled={
                              savingPaymentMethod ||
                              !paymentMethod ||
                              !paymentTreasuryAccountId ||
                              compatibleTreasuryAccounts.length === 0
                            }
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-500 disabled:opacity-50"
                          >
                            {savingPaymentMethod ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            <span>
                              {savingPaymentMethod ? "Guardando..." : "Guardar"}
                            </span>
                          </button>
                        </div>

                        {/* MENSAJES DUALES DE AYUDA */}
                        {paymentMethod &&
                          compatibleTreasuryAccounts.length === 0 && (
                            <p className="mt-2 text-xs font-medium text-amber-600">
                              No tenés cuentas activas compatibles. Creá una
                              cuenta de tesorería de tipo{" "}
                              <span className="font-bold">
                                {PAYMENT_METHOD_TREASURY_TYPES[
                                  paymentMethod
                                ]?.join(" o ")}
                              </span>
                              .
                            </p>
                          )}
                        {paymentMethod &&
                          compatibleTreasuryAccounts.length === 1 && (
                            <p className="mt-2 text-xs text-slate-400">
                              Cuenta sugerida y seleccionada automáticamente.
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
