// src/mini-back/orchestrator/cash-register/cash-register-orchestrator.ts

import {
  CashRegister,
  CashRegisterPaymentMethod,
  CashRegisterPaymentMethodServicePublic,
  CashRegisterServicePublic,
  CreateCashRegisterInput,
  CreateCashRegisterPaymentMethodInput,
  ICashRegisterService,
  UpdateCashRegisterInput,
} from "@/mini-back/core/cash-register-core/public";
import { ICashRegisterPaymentMethodService } from "@/mini-back/core/cash-register-core/public/cash-register-payment-method-service.interface";

import { CashRegisterDexieRepository } from "@/mini-back/infrastructure/dexie/repositories/cash-register/cash-register-dexie.repository";
import { CashRegisterPaymentMethodRepository } from "@/mini-back/infrastructure/dexie/repositories/cash-register/cash-register-payment-method-dexie.repository";
import { CashRegisterValidationRepository } from "@/mini-back/infrastructure/dexie/repositories/cash-register/cash-register-validation-dexie.repository";

import { TreasuryAccountValidationDexieAdapter } from "@/mini-back/infrastructure/dexie/repositories/cash-register/treasury-account-validation-dexie.repository";
import { PaymentMethodTypeFinancial } from "@/mini-back/shared/enums/financial-movement-status.enum";

export interface CashRegisterWithPaymentMethods {
  cashRegister: CashRegister;
  paymentMethods: CashRegisterPaymentMethod[];
}

export class CashRegisterOrchestrator {
  private readonly cashRegisterService: ICashRegisterService;

  private readonly cashRegisterPaymentMethodService: ICashRegisterPaymentMethodService;

  constructor() {
    const treasuryAccountValidationAdapter =
      new TreasuryAccountValidationDexieAdapter();

    this.cashRegisterService = CashRegisterServicePublic(
      new CashRegisterDexieRepository(),
      treasuryAccountValidationAdapter,
    );

    this.cashRegisterPaymentMethodService =
      CashRegisterPaymentMethodServicePublic(
        new CashRegisterPaymentMethodRepository(),
        new CashRegisterValidationRepository(),
        treasuryAccountValidationAdapter,
      );
  }

  async create(input: CreateCashRegisterInput): Promise<CashRegister> {
    return this.cashRegisterService.create(input);
  }

  async resolveTreasuryAccountId(
    cashRegisterId: string,
    paymentMethod: PaymentMethodTypeFinancial,
    businessId: string,
  ): Promise<string> {
    const cashRegister = await this.cashRegisterService.findById(
      cashRegisterId,
      businessId,
    );

    if (paymentMethod === "CASH") {
      return cashRegister.defaultTreasuryAccountId;
    }

    return this.cashRegisterPaymentMethodService.resolveTreasuryAccountId(
      cashRegisterId,
      paymentMethod,
      businessId,
    );
  }

  async createPaymentMethod(
    input: CreateCashRegisterPaymentMethodInput,
  ): Promise<CashRegisterPaymentMethod> {
    return this.cashRegisterPaymentMethodService.create(input);
  }

  async update(input: UpdateCashRegisterInput): Promise<CashRegister> {
    return this.cashRegisterService.update(input);
  }

  async toggleActive(
    idTemp: string,
    businessId: string,
  ): Promise<CashRegister> {
    return this.cashRegisterService.toggleActive(idTemp, businessId);
  }

  async findById(idTemp: string, businessId: string): Promise<CashRegister> {
    return this.cashRegisterService.findById(idTemp, businessId);
  }

  async findByBusinessId(businessId: string): Promise<CashRegister[]> {
    return this.cashRegisterService.findByBusinessId(businessId);
  }

  async findActiveByBusinessId(businessId: string): Promise<CashRegister[]> {
    return this.cashRegisterService.findActiveByBusinessId(businessId);
  }

  async findByIdWithPaymentMethods(
    idTemp: string,
    businessId: string,
  ): Promise<CashRegisterWithPaymentMethods> {

    // console.log(idTemp, businessId)
    const cashRegister = await this.cashRegisterService.findById(
      idTemp,
      businessId,
    );

    // console.log("cashRegister",cashRegister)

    const paymentMethods =
      await this.cashRegisterPaymentMethodService.findByCashRegisterId(
        idTemp,
        businessId,
      );

      // console.log("paymentMethods", paymentMethods)

    return {
      cashRegister,
      paymentMethods,
    };
  }
}
