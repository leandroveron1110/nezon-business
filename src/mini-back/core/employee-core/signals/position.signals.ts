export type PositionCreatedSignal = {
  type: "POSITION_CREATED";
  payload: { positionId: string; businessId: string; name: string };
};

export type PositionUpdatedSignal = {
  type: "POSITION_UPDATED";
  payload: { positionId: string };
};