import { Position } from "../domain/position";
import { CreatePositionInput } from "../inputs/create-position.input";
import { UpdatePositionInput } from "../inputs/update-position.input";
import { PositionPorts } from "../ports/position.ports";

export class PositionCoreService {
  constructor(private readonly ports: PositionPorts) {}

  async create(input: CreatePositionInput): Promise<Position> {
    if (!input.name || input.name.trim() === "") {
      throw new Error(
        "Invariante Rota: El nombre del puesto no puede estar vacío.",
      );
    }

    const position = await this.ports.createPosition(input);

    return position;
  }

  async update(input: UpdatePositionInput): Promise<{ positionId: string }> {
    await this.mustExist(input.positionId);

    if (input.name !== undefined && input.name.trim() === "") {
      throw new Error(
        "Invariante Rota: El nombre del puesto no puede estar vacío.",
      );
    }

    await this.ports.updatePosition(input);

    return { positionId: input.positionId };
  }

  async findById(positionId: string): Promise<Position | null> {
    return this.ports.findPositionById(positionId);
  }

  async findByBusinessId(businessId: string): Promise<Position[]> {
    return this.ports.findPositionsByBusinessId(businessId);
  }

  private async mustExist(positionId: string): Promise<Position> {
    const position = await this.ports.findPositionById(positionId);
    if (!position) {
      throw new Error(
        `Invariante Rota: El puesto con ID ${positionId} no existe.`,
      );
    }
    return position;
  }
}
