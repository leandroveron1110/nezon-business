// treasury-core/service/treasury-account.service.ts

import { TreasuryAccount } from "../../domain/treasury-account/treasury-account";

import { CreateTreasuryAccountInput } from "../../input/treasury-account/create-treasury-account.input";
import { UpdateTreasuryAccountInput } from "../../input/treasury-account/update-treasury-account.input";

import { TreasuryAccountPort } from "../../port/treasury-account/treasury-account.port";
import { FinancialMovementPort } from "../../public";

import { ITreasuryAccountPublicService } from "../../public/treasury-account-service.interface";

/**
 * Servicio encargado de administrar las cuentas
 * que componen la tesorería de un negocio.
 *
 * Su responsabilidad es administrar la existencia
 * y el estado administrativo de las cuentas.
 *
 * No administra movimientos financieros ni modifica
 * balances directamente.
 *
 * Los cambios sobre currentBalance deben producirse
 * como consecuencia de FinancialMovements.
 */
export class TreasuryAccountService implements ITreasuryAccountPublicService {
  constructor(
    private readonly treasuryAccount: TreasuryAccountPort,
    private readonly financialMovement: FinancialMovementPort,
  ) {}

  /**
   * Crea una nueva cuenta dentro de la tesorería del negocio.
   *
   * Una cuenta representa un lugar o medio concreto
   * donde el negocio mantiene dinero.
   *
   * Toda cuenta nueva comienza con saldo cero.
   *
   * El saldo inicial no se asigna directamente desde
   * la creación de la cuenta. Cualquier ingreso de dinero
   * debe quedar registrado mediante FinancialMovement.
   */
  async create(input: CreateTreasuryAccountInput): Promise<TreasuryAccount> {
    const name = this.normalizeName(input.name);

    await this.ensureNameIsAvailable(input.businessId, name);

    const now = new Date();
    const account: TreasuryAccount = {
      idTemp: input.id,
      businessId: input.businessId,
      name,
      type: input.type,
      currency: input.currency,
      currentBalance: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return this.treasuryAccount.save(account);
  }

  /**
   * Actualiza los datos administrativos de una cuenta.
   *
   * Actualmente solo permite modificar el nombre.
   *
   * No permite modificar:
   * - type
   * - currency
   * - currentBalance
   *
   * Esto protege la consistencia histórica de los
   * movimientos asociados a la cuenta.
   */
  async update(input: UpdateTreasuryAccountInput): Promise<TreasuryAccount> {
    const account = await this.getRequiredAccount(input.accountId);

    const name = this.normalizeName(input.name);

    /**
     * Si el nombre cambió, verificamos que no exista
     * otra cuenta con el mismo nombre dentro del negocio.
     */
    if (account.name !== name) {
      await this.ensureNameIsAvailable(account.businessId, name, account.id);
    }

    const updatedAccount: TreasuryAccount = {
      ...account,
      name,
      updatedAt: new Date(),
    };

    return this.treasuryAccount.save(updatedAccount);
  }

  /**
   * Busca una cuenta de tesorería por su identificador.
   *
   * Devuelve null si la cuenta no existe.
   */
  async findById(accountId: string): Promise<TreasuryAccount | null> {
    return this.treasuryAccount.findById(accountId);
  }

  /**
   * Obtiene todas las cuentas de tesorería del negocio.
   *
   * Incluye tanto cuentas activas como inactivas.
   *
   * Resulta útil para consultas administrativas e historial.
   */
  async findByBusinessId(businessId: string): Promise<TreasuryAccount[]> {
    return this.treasuryAccount.findByBusinessId(businessId);
  }

  /**
   * Obtiene únicamente las cuentas activas del negocio.
   *
   * Estas son las cuentas que pueden utilizarse
   * para nuevas operaciones financieras.
   */
  async findActiveByBusinessId(businessId: string): Promise<TreasuryAccount[]> {
    return this.treasuryAccount.findActiveByBusinessId(businessId);
  }

  /**
   * Desactiva una cuenta de tesorería.
   *
   * La cuenta no se elimina para preservar el historial
   * de movimientos financieros asociados.
   *
   * Una cuenta desactivada deja de estar disponible
   * para nuevas operaciones.
   */
  async deactivate(accountId: string): Promise<TreasuryAccount> {
    const account = await this.getRequiredAccount(accountId);

    /**
     * Evita escrituras innecesarias si la cuenta
     * ya se encuentra desactivada.
     */
    if (!account.isActive) {
      return account;
    }

    const updatedAccount: TreasuryAccount = {
      ...account,
      isActive: false,
      updatedAt: new Date(),
    };

    return this.treasuryAccount.save(updatedAccount);
  }

  /**
   * Reactiva una cuenta previamente desactivada.
   *
   * Al activarse vuelve a estar disponible para
   * nuevas operaciones financieras.
   */
  async activate(accountId: string): Promise<TreasuryAccount> {
    const account = await this.getRequiredAccount(accountId);

    /**
     * Evita escrituras innecesarias si la cuenta
     * ya se encuentra activa.
     */
    if (account.isActive) {
      return account;
    }

    const updatedAccount: TreasuryAccount = {
      ...account,
      isActive: true,
      updatedAt: new Date(),
    };

    return this.treasuryAccount.save(updatedAccount);
  }

  /**
   * Recalcula y actualiza el saldo materializado
   * de una cuenta de tesorería.
   *
   * El cálculo se delega al FinancialMovementPort para
   * evitar cargar todos los movimientos financieros
   * en memoria.
   *
   * FinancialMovement conserva el historial financiero.
   * currentBalance almacena el resultado materializado
   * para permitir consultas rápidas.
   */
  async recalculateBalance(
    accountId: string,
    businessId: string,
  ): Promise<TreasuryAccount> {
    const account = await this.getRequiredAccount(accountId);

    if (account.businessId !== businessId) {
      throw new Error("Treasury account does not belong to this business");
    }

    const calculatedBalance =
      await this.financialMovement.calculateBalanceByTreasuryAccount(
        accountId,
        businessId,
      );

    const updatedAccount: TreasuryAccount = {
      ...account,
      currentBalance: calculatedBalance,
      updatedAt: new Date(),
    };

    return this.treasuryAccount.save(updatedAccount);
  }

  /**
   * Obtiene una cuenta por su ID.
   *
   * A diferencia de findById(), este método garantiza
   * que la cuenta exista.
   *
   * Si no existe, interrumpe la operación mediante
   * un error de negocio.
   */
  private async getRequiredAccount(
    accountId: string,
  ): Promise<TreasuryAccount> {
    const account = await this.treasuryAccount.findById(accountId);

    if (!account) {
      throw new Error("Treasury account not found");
    }

    return account;
  }

  /**
   * Normaliza y valida el nombre de una cuenta.
   *
   * Elimina espacios innecesarios y evita que se creen
   * cuentas sin un nombre identificable.
   */
  private normalizeName(name: string): string {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new Error("Treasury account name cannot be empty");
    }

    return normalizedName;
  }

  /**
   * Verifica que no exista otra cuenta con el mismo
   * nombre dentro del negocio.
   *
   * excludeAccountId se utiliza durante una actualización
   * para no considerar la propia cuenta como duplicada.
   */
  private async ensureNameIsAvailable(
    businessId: string,
    name: string,
    excludeAccountId?: string,
  ): Promise<void> {
    const existingAccount = await this.treasuryAccount.findByBusinessIdAndName(
      businessId,
      name,
    );

    if (existingAccount && existingAccount.idTemp !== excludeAccountId) {
      throw new Error("A treasury account with this name already exists");
    }
  }
}
