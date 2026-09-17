export type EmployeeCreatedSignal = {
  type: "EMPLOYEE_CREATED";
  payload: { employeeId: string; businessId: string };
};

export type EmployeeUpdatedSignal = {
  type: "EMPLOYEE_UPDATED";
  payload: { employeeId: string };
};

export type EmployeeActivatedSignal = {
  type: "EMPLOYEE_ACTIVATED";
  payload: { employeeId: string };
};

export type EmployeeDeactivatedSignal = {
  type: "EMPLOYEE_DEACTIVATED";
  payload: { employeeId: string };
};