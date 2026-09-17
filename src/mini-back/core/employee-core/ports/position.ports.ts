import { Position } from "../domain/position";
import { CreatePositionInput } from "../inputs/create-position.input";
import { UpdatePositionInput } from "../inputs/update-position.input";

export interface PositionPorts {
  findPositionById(positionId: string): Promise<Position | null>;
  findPositionsByBusinessId(businessId: string): Promise<Position[]>;
  createPosition(input: CreatePositionInput): Promise<Position>;
  updatePosition(input: UpdatePositionInput): Promise<Position>;
}