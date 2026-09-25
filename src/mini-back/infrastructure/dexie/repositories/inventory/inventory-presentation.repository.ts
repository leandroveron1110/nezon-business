import { InventoryPresentationModel } from "@/mini-back/core/inventory-core/public";
import { InventoryPresentationPorts } from "@/mini-back/core/inventory-core/ports/inventory-presentation.ports";
import { db } from "../../db";
import { LocalInventoryPresentation } from "../../shcema/inventory/inventory-presentation.schema";

export class InventoryPresentationRepository implements InventoryPresentationPorts {
  async findPresentationByIdTemp(
    idTemp: string,
  ): Promise<InventoryPresentationModel | null> {
    const record = await db.inventoryPresentations.get(idTemp);

    return record ? (record as InventoryPresentationModel) : null;
  }

  async findPresentationsByProduct(
    inventoryProductIdTemp: string,
  ): Promise<InventoryPresentationModel[]> {
    const records = await db.inventoryPresentations
      .where("inventoryProductIdTemp")
      .equals(inventoryProductIdTemp)
      .toArray();

    return records as InventoryPresentationModel[];
  }

  async savePresentation(
    presentation: InventoryPresentationModel,
  ): Promise<void> {
    await db.inventoryPresentations.put(
      presentation as LocalInventoryPresentation,
    );
  }
}
