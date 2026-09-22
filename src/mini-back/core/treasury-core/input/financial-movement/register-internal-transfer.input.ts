export interface RegisterInternalTransferInput {
  idTemp: string;
  idTempIncoming: string; 
  businessId: string;
  sourceTreasuryAccountId: string;
  destinationTreasuryAccountId: string;
  outgoingClientMovementId?: string;
  incomingClientMovementId?: string;
  transferGroupId?: string;
  userId: string;
  amount: number;
  description: string;
  notes: string;
  externalReference: string;
}