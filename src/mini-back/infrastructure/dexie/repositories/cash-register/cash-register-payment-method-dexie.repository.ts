import { CashRegisterPaymentMethod } from "@/mini-back/core/cash-register-core/domain/cash-register-payment-method/cash-register-payment-method";
import { CashRegisterPaymentMethodPort } from "@/mini-back/core/cash-register-core/port/cash-register-payment-method/cash-register-payment-method.port";
import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";
import { LocalCashRegisterPaymentMethod } from "../../shcema/cash-register-payment-method.schema";
import { db } from "../../db";

export class CashRegisterPaymentMethodRepository implements CashRegisterPaymentMethodPort {
  async save(
    paymentMethod: CashRegisterPaymentMethod,
  ): Promise<CashRegisterPaymentMethod> {
    const localPaymentMethod: LocalCashRegisterPaymentMethod = {
      ...paymentMethod,
      syncStatus: "LOCAL_ONLY",
      syncPriority: "HIGH",
    };

    await db.cashRegisterPaymentMethod.put(localPaymentMethod);

    return paymentMethod;
  }

  async findByIdTemp(
    idTemp: string,
  ): Promise<CashRegisterPaymentMethod | null> {
    const result = await db.cashRegisterPaymentMethod.get(idTemp);

    if (!result) {
      return null;
    }

    return this.toDomain(result);
  }

  async findByCashRegisterId(
    cashRegisterId: string,
  ): Promise<CashRegisterPaymentMethod[]> {
    const results = await db.cashRegisterPaymentMethod
      .where("cashRegisterId")
      .equals(cashRegisterId)
      .toArray();

      // console.log("findByCashRegisterId repo", results, cashRegisterId)
    return results.map((item) => this.toDomain(item));
  }

  async findByCashRegisterAndPaymentMethod(
    cashRegisterId: string,
    paymentMethod: PaymentMethodTypeFinancial,
  ): Promise<CashRegisterPaymentMethod | null> {
    const result = await db.cashRegisterPaymentMethod
      .where("[cashRegisterId+paymentMethod]")
      .equals([cashRegisterId, paymentMethod])
      .first();

    if (!result) {
      return null;
    }

    return this.toDomain(result);
  }

  async deleteByIdTemp(idTemp: string): Promise<void> {
    await db.cashRegisterPaymentMethod.delete(idTemp);
  }

  private toDomain(
    local: LocalCashRegisterPaymentMethod,
  ): CashRegisterPaymentMethod {
    const {
      syncStatus: _syncStatus,
      syncPriority: _syncPriority,
      ...domain
    } = local;

    return { ...domain, id: domain.id || null };
  }
}
