// src/common/database/index.ts
import Dexie, { type Table } from "dexie";
import { type LocalProduct, PRODUCTS_STORE } from "./shcema/products.schema";
import { type LocalOrder, ORDERS_STORE } from "./shcema/orders.schema";
import { DELIVERY_STORE, LocalConfigRecord } from "./shcema/delivery.schema";
import { ORDER_STATE_EVENTS_STORE } from "./shcema/orderStateEvents";
import { BUSINESS_STORE, LocalBusiness } from "./shcema/business.schema";
import {
  CASH_REGISTER_TURN_STORE,
  LocalCashRegisterTurn,
} from "./shcema/cash-register-turn.schema";
import {
  FINANCIAL_MOVEMENT_STORE,
  LocalFinancialMovement,
} from "./shcema/financial-movement.schema";
import {
  LocalTreasuryAccount,
  TREASURY_ACCOUNT_STORE,
} from "./shcema/treasury-account.schema";
import {
  CASH_REGISTER_STORE,
  LocalCashRegister,
} from "./shcema/cash-register.schema";
import {
  CASH_REGISTER_PAYMENT_METHOD_STORE,
  LocalCashRegisterPaymentMethod,
} from "./shcema/cash-register-payment-method.schema";
import {
  BUSINESS_ROLE_STORE,
  LocalBusinessRole,
} from "./shcema/business-role.schema";
import {
  BUSINESS_EMPLOYEE_STORE,
  LocalBusinessEmployee,
} from "./shcema/business-employee.schema";
import {
  BUSINESS_EMPLOYEE_OVERRIDE_STORE,
  LocalBusinessEmployeeOverride,
} from "./shcema/business-employee-override.schema";
import { LocalPosition, POSITION_STORE } from "./shcema/position.schema";
import {
  EMPLOYEE_WORK_SESSION_STORE,
  LocalEmployeeWorkSession,
} from "./shcema/employee-work-session.schema";
import {
  EMPLOYEE_SETTLEMENT_STORE,
  LocalEmployeeSettlement,
} from "./shcema/employee-settlement.schema";

export class HunayDB extends Dexie {
  business!: Table<LocalBusiness>;
  products!: Table<LocalProduct>;
  orders!: Table<LocalOrder>;
  deliveryConfig!: Table<LocalConfigRecord>;
  cashRegisterTurn!: Table<LocalCashRegisterTurn>;
  cashRegister!: Table<LocalCashRegister>;
  financialMovement!: Table<LocalFinancialMovement>;
  treasuryAccount!: Table<LocalTreasuryAccount>;
  cashRegisterPaymentMethod!: Table<LocalCashRegisterPaymentMethod>;
  // orderStateEvents!: Table<OrderStateEvent>;
  metadata!: Table<{ id: string; value: string }>;

  businessRoles!: Table<LocalBusinessRole, string>;
  businessEmployees!: Table<LocalBusinessEmployee, string>;
  businessEmployeeOverrides!: Table<LocalBusinessEmployeeOverride, string>;
  positions!: Table<LocalPosition, string>;
  employeeWorkSessions!: Table<LocalEmployeeWorkSession, string>;
  employeeSettlements!: Table<LocalEmployeeSettlement, string>;

  constructor() {
    super("HunayBusinessDB");

    this.version(5).stores({
      business: BUSINESS_STORE,
      products: PRODUCTS_STORE,
      orders: ORDERS_STORE,
      deliveryConfig: DELIVERY_STORE,
      orderStateEvents: ORDER_STATE_EVENTS_STORE,
      cashRegisterTurn: CASH_REGISTER_TURN_STORE,
      cashRegister: CASH_REGISTER_STORE,
      cashRegisterPaymentMethod: CASH_REGISTER_PAYMENT_METHOD_STORE,
      financialMovement: FINANCIAL_MOVEMENT_STORE,
      treasuryAccount: TREASURY_ACCOUNT_STORE,
      metadata: "id",

      businessRoles: BUSINESS_ROLE_STORE,
      businessEmployees: BUSINESS_EMPLOYEE_STORE,
      businessEmployeeOverrides: BUSINESS_EMPLOYEE_OVERRIDE_STORE,
      positions: POSITION_STORE,
      employeeWorkSessions: EMPLOYEE_WORK_SESSION_STORE,
      employeeSettlements: EMPLOYEE_SETTLEMENT_STORE,
    });
  }
}

let dbInstance: HunayDB | null = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new HunayDB();
  }

  return dbInstance;
}
export const db = getDb();
