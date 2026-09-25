import { InventoryLocationModel } from "../../domain/models/inventory-location.model";

import { CreateLocationInput } from "../../inputs/location/create-location.input";
import { UpdateLocationInput } from "../../inputs/location/update-location.input";
import { ActivateLocationInput } from "../../inputs/location/activate-location.input";
import { DeactivateLocationInput } from "../../inputs/location/deactivate-location.input";
import { ILocationPublicService } from "../../public/location-service.interface";
import { InventoryLocationPorts } from "../../ports/inventory-location.ports";

export class LocationService implements ILocationPublicService {
  constructor(private readonly ports: InventoryLocationPorts) {}
  findByIdTemp(idTemp: string): Promise<InventoryLocationModel | null> {
    return this.ports.findLocationByIdTemp(idTemp);
  }
  findAll(businessId: string): Promise<InventoryLocationModel[]> {
    return this.ports.findAllLocations(businessId);
  }

  async create(input: CreateLocationInput): Promise<InventoryLocationModel> {
    if (!input.businessId) {
      throw new Error("businessId es obligatorio.");
    }

    if (!input.idTemp) {
      throw new Error("idTemp es obligatorio.");
    }

    const name = input.name.trim();

    if (!name) {
      throw new Error("El nombre de la ubicación es obligatorio.");
    }

    const now = new Date().toISOString();

    const location: InventoryLocationModel = {
      idTemp: input.idTemp,
      businessId: input.businessId,
      code: input.code ?? null,
      name,
      description: input.description ?? null,
      isDefault: input.isDefault,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await this.ports.saveLocation(location);

    return location;
  }

  async update(input: UpdateLocationInput): Promise<InventoryLocationModel> {
    const location = await this.ports.findLocationByIdTemp(input.idTemp);

    if (!location) {
      throw new Error("Ubicación no encontrada.");
    }

    if (location.businessId !== input.businessId) {
      throw new Error("La ubicación no pertenece al negocio.");
    }

    if (input.name !== undefined && !input.name.trim()) {
      throw new Error("El nombre de la ubicación no puede estar vacío.");
    }

    const updatedLocation: InventoryLocationModel = {
      ...location,

      code: input.code !== undefined ? input.code : location.code,

      name: input.name !== undefined ? input.name.trim() : location.name,

      description:
        input.description !== undefined
          ? input.description
          : location.description,

      updatedAt: new Date().toISOString(),
    };

    await this.ports.saveLocation(updatedLocation);

    return updatedLocation;
  }

  async activate(
    input: ActivateLocationInput,
  ): Promise<InventoryLocationModel> {
    const location = await this.ports.findLocationByIdTemp(input.idTemp);

    if (!location) {
      throw new Error("Ubicación no encontrada.");
    }

    if (location.businessId !== input.businessId) {
      throw new Error("La ubicación no pertenece al negocio.");
    }

    if (location.isActive) {
      return location;
    }

    const updatedLocation: InventoryLocationModel = {
      ...location,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    await this.ports.saveLocation(updatedLocation);

    return updatedLocation;
  }

  async deactivate(
    input: DeactivateLocationInput,
  ): Promise<InventoryLocationModel> {
    const location = await this.ports.findLocationByIdTemp(input.idTemp);

    if (!location) {
      throw new Error("Ubicación no encontrada.");
    }

    if (location.businessId !== input.businessId) {
      throw new Error("La ubicación no pertenece al negocio.");
    }

    if (!location.isActive) {
      return location;
    }

    const updatedLocation: InventoryLocationModel = {
      ...location,
      isActive: false,
      updatedAt: new Date().toISOString(),
    };

    await this.ports.saveLocation(updatedLocation);

    return updatedLocation;
  }
}
