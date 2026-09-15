import { CashRegister } from "../domain/cash-register/cash-register";
import { CreateCashRegisterInput } from "../input/cash-register/create-cash-register.input";
import { UpdateCashRegisterInput } from "../input/cash-register/update-cash-register.input";
import {
  CashRegisterPort,
  TreasuryAccountValidationPort,
} from "../port/cash-register.port";
import { ICashRegisterService } from "../public/cash-register-service.interface";

export class CashRegisterService implements ICashRegisterService {
  constructor(
    private readonly cashRegisterPort: CashRegisterPort,
    private readonly treasuryAccountValidationPort: TreasuryAccountValidationPort,
  ) {}

  async findById(idTemp: string, businessId: string): Promise<CashRegister> {
    const register = await this.cashRegisterPort.findByIdTemp(idTemp);
    if (!register || register.businessId !== businessId) {
      throw new Error("Caja no encontrada.");
    }
    
    return register
  }

  async create(input: CreateCashRegisterInput): Promise<CashRegister> {
    const normalizedName = this.normalizeName(input.name);

    // 1. Validar nombre disponible
    await this.ensureNameIsAvailable(input.businessId, normalizedName);

    // 2. Validar que la cuenta de tesorería asociada por defecto exista y esté activa
    const isTreasuryValid =
      await this.treasuryAccountValidationPort.existsAndIsActive(
        input.defaultTreasuryAccountId,
        input.businessId,
      );
    if (!isTreasuryValid) {
      throw new Error(
        "Invariante Rota: La cuenta de tesorería por defecto asignada no existe o está inactiva.",
      );
    }

    // 3. Dominio Puro
    const now = new Date();
    const newRegister: CashRegister = {
      idTemp: input.idTemp,
      id: null,
      businessId: input.businessId,
      name: normalizedName,
      defaultTreasuryAccountId: input.defaultTreasuryAccountId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return this.cashRegisterPort.save(newRegister);
  }

  async update(input: UpdateCashRegisterInput): Promise<CashRegister> {
    const register = await this.cashRegisterPort.findByIdTemp(input.idTemp);
    if (!register || register.businessId !== input.businessId) {
      throw new Error("Negocio Denegado: La caja física no existe.");
    }

    const normalizedName = this.normalizeName(input.name);

    if (register.name !== normalizedName) {
      await this.ensureNameIsAvailable(
        input.businessId,
        normalizedName,
        register.idTemp,
      );
    }

    let defaultTreasuryAccountId = register.defaultTreasuryAccountId;

    if (
      input.defaultTreasuryAccountId &&
      input.defaultTreasuryAccountId !== register.defaultTreasuryAccountId
    ) {
      const isTreasuryValid =
        await this.treasuryAccountValidationPort.existsAndIsActive(
          input.defaultTreasuryAccountId,
          input.businessId,
        );
      if (!isTreasuryValid) {
        throw new Error(
          "Invariante Rota: La nueva cuenta de tesorería asignada no está activa.",
        );
      }
      defaultTreasuryAccountId = input.defaultTreasuryAccountId;
    }

    const updatedRegister: CashRegister = {
      ...register,
      name: normalizedName,
      defaultTreasuryAccountId,
      updatedAt: new Date(),
    };

    return this.cashRegisterPort.save(updatedRegister);
  }

  async toggleActive(
    idTemp: string,
    businessId: string,
  ): Promise<CashRegister> {
    const register = await this.cashRegisterPort.findByIdTemp(idTemp);
    if (!register || register.businessId !== businessId) {
      throw new Error("Caja no encontrada.");
    }

    const updatedRegister: CashRegister = {
      ...register,
      isActive: !register.isActive,
      updatedAt: new Date(),
    };

    return this.cashRegisterPort.save(updatedRegister);
  }

  async findByBusinessId(businessId: string): Promise<CashRegister[]> {
    return this.cashRegisterPort.findByBusinessId(businessId);
  }

  async findActiveByBusinessId(businessId: string): Promise<CashRegister[]> {
    const registers = await this.cashRegisterPort.findByBusinessId(businessId);
    return registers.filter((r) => r.isActive);
  }

  private normalizeName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("El nombre de la caja física no puede estar vacío.");
    }
    return trimmed;
  }

  private async ensureNameIsAvailable(
    businessId: string,
    name: string,
    excludeIdTemp?: string,
  ): Promise<void> {
    const existing = await this.cashRegisterPort.findByName(businessId, name);
    if (existing && existing.idTemp !== excludeIdTemp) {
      throw new Error(`Ya existe una caja registrada con el nombre "${name}".`);
    }
  }
}
