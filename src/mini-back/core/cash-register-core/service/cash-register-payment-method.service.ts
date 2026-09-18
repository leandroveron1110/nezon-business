import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";
import { CashRegisterPaymentMethod } from "../domain/cash-register-payment-method/cash-register-payment-method";
import { CreateCashRegisterPaymentMethodInput } from "../input/cash-register-payment-method/create-cash-register-payment-method.input";
import { UpdateCashRegisterPaymentMethodInput } from "../input/cash-register-payment-method/update-cash-register-payment-method.input";
import { CashRegisterPaymentMethodPort } from "../port/cash-register-payment-method/cash-register-payment-method.port";
import { ICashRegisterPaymentMethodService } from "../public/cash-register-payment-method-service.interface";
import {
  CashRegisterValidationPort,
  TreasuryAccountValidationPort,
} from "../public";

export class CashRegisterPaymentMethodService implements ICashRegisterPaymentMethodService {
  constructor(
    private readonly cashRegisterPaymentMethodPort: CashRegisterPaymentMethodPort,
    private readonly cashRegisterValidationPort: CashRegisterValidationPort,
    private readonly treasuryAccountValidationPort: TreasuryAccountValidationPort,
  ) {}

  async resolveTreasuryAccountId(
    cashRegisterId: string,
    paymentMethod: PaymentMethodTypeFinancial,
    businessId: string,
  ): Promise<string> {
    // 1. Verificar que la caja exista y pertenezca al negocio.
    await this.ensureCashRegisterExists(cashRegisterId, businessId);

    // 2. Buscar la configuración del medio de pago.
    const configuration =
      await this.cashRegisterPaymentMethodPort.findByCashRegisterAndPaymentMethod(
        cashRegisterId,
        paymentMethod,
      );

    if (!configuration) {
      throw new Error(
        `El medio de pago "${paymentMethod}" no está configurado para esta caja.`,
      );
    }

    // 3. Verificar que la configuración esté activa.
    if (!configuration.isActive) {
      throw new Error(
        `El medio de pago "${paymentMethod}" está inactivo para esta caja.`,
      );
    }

    // 4. Devolver la cuenta de tesorería asociada.
    return configuration.treasuryAccountIdTemp;
  }

  async create(
    input: CreateCashRegisterPaymentMethodInput,
  ): Promise<CashRegisterPaymentMethod> {
    // 1. Validar que la caja exista y pertenezca al negocio.
    await this.ensureCashRegisterExists(input.cashRegisterId, input.businessId);

    // 2. Validar que la cuenta de tesorería exista y esté activa.
    await this.ensureTreasuryAccountIsValid(
      input.treasuryAccountIdTemp,
      input.businessId,
    );

    // 3. Validar que no exista ya ese medio de pago para la caja.
    await this.ensurePaymentMethodIsAvailable(
      input.cashRegisterId,
      input.paymentMethod,
    );

    // 4. Crear dominio puro.
    const now = new Date();

    const newPaymentMethod: CashRegisterPaymentMethod = {
      idTemp: input.idTemp,
      id: null,
      businessId: input.businessId,
      cashRegisterId: input.cashRegisterId,
      paymentMethod: input.paymentMethod,
     treasuryAccountIdTemp: input.treasuryAccountIdTemp,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return this.cashRegisterPaymentMethodPort.save(newPaymentMethod);
  }

  async update(
    input: UpdateCashRegisterPaymentMethodInput,
  ): Promise<CashRegisterPaymentMethod> {
    // 1. Buscar configuración.
    const paymentMethod = await this.cashRegisterPaymentMethodPort.findByIdTemp(
      input.idTemp,
    );

    if (!paymentMethod || paymentMethod.businessId !== input.businessId) {
      throw new Error(
        "Negocio Denegado: La configuración del medio de pago no existe.",
      );
    }

    let nextPaymentMethod = paymentMethod.paymentMethod;
    let nextTreasuryAccountId = paymentMethod.treasuryAccountIdTemp;
    let nextIsActive = paymentMethod.isActive;

    // 2. Si cambia el medio de pago, verificar que no esté duplicado.
    if (
      input.paymentMethod &&
      input.paymentMethod !== paymentMethod.paymentMethod
    ) {
      await this.ensurePaymentMethodIsAvailable(
        paymentMethod.cashRegisterId,
        input.paymentMethod,
        paymentMethod.idTemp,
      );

      nextPaymentMethod = input.paymentMethod;
    }

    // 3. Si cambia la cuenta de tesorería, validarla.
    if (
      input.treasuryAccountIdTemp &&
      input.treasuryAccountIdTemp !== paymentMethod.treasuryAccountIdTemp
    ) {
      await this.ensureTreasuryAccountIsValid(
        input.treasuryAccountIdTemp,
        input.businessId,
      );

      nextTreasuryAccountId = input.treasuryAccountIdTemp;
    }

    // 4. Actualizar estado si fue enviado.
    if (input.isActive !== undefined) {
      nextIsActive = input.isActive;
    }

    const updatedPaymentMethod: CashRegisterPaymentMethod = {
      ...paymentMethod,
      paymentMethod: nextPaymentMethod,
     treasuryAccountIdTemp: nextTreasuryAccountId,
      isActive: nextIsActive,
      updatedAt: new Date(),
    };

    return this.cashRegisterPaymentMethodPort.save(updatedPaymentMethod);
  }

  async toggleActive(
    idTemp: string,
    businessId: string,
  ): Promise<CashRegisterPaymentMethod> {
    const paymentMethod =
      await this.cashRegisterPaymentMethodPort.findByIdTemp(idTemp);

    if (!paymentMethod || paymentMethod.businessId !== businessId) {
      throw new Error(
        "Negocio Denegado: La configuración del medio de pago no existe.",
      );
    }

    const updatedPaymentMethod: CashRegisterPaymentMethod = {
      ...paymentMethod,
      isActive: !paymentMethod.isActive,
      updatedAt: new Date(),
    };

    return this.cashRegisterPaymentMethodPort.save(updatedPaymentMethod);
  }

  async findByCashRegisterId(
    cashRegisterId: string,
    businessId: string,
  ): Promise<CashRegisterPaymentMethod[]> {
    await this.ensureCashRegisterExists(cashRegisterId, businessId);

    return this.cashRegisterPaymentMethodPort.findByCashRegisterId(
      cashRegisterId,
    );
  }

  private async ensureCashRegisterExists(
    cashRegisterId: string,
    businessId: string,
  ): Promise<void> {
    const exists = await this.cashRegisterValidationPort.existsByIdTemp(
      cashRegisterId,
      businessId,
    );

    if (!exists) {
      throw new Error("Negocio Denegado: La caja física no existe.");
    }
  }

  private async ensureTreasuryAccountIsValid(
   treasuryAccountIdTemp: string,
    businessId: string,
  ): Promise<void> {
    const isValid = await this.treasuryAccountValidationPort.existsAndIsActive(
     treasuryAccountIdTemp,
      businessId,
    );

    if (!isValid) {
      throw new Error("La cuenta de tesorería no existe o está inactiva.");
    }
  }

  private async ensurePaymentMethodIsAvailable(
    cashRegisterId: string,
    paymentMethod: PaymentMethodTypeFinancial,
    excludeIdTemp?: string,
  ): Promise<void> {
    const existing =
      await this.cashRegisterPaymentMethodPort.findByCashRegisterAndPaymentMethod(
        cashRegisterId,
        paymentMethod,
      );

    if (existing && existing.idTemp !== excludeIdTemp) {
      throw new Error(
        `El medio de pago "${paymentMethod}" ya está configurado para esta caja.`,
      );
    }
  }
}
