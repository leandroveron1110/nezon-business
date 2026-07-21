export interface MutateDeliveryInput {
   orderId: string;

   executionStatus:
      | "ASSIGNED"
      | "IN_TRANSIT"
      | "DELIVERED"
      | "FAILED";
}