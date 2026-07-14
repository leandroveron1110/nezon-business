import { db } from "../db";
import { LocalBusiness } from "../shcema/business.schema";

export class BusinessLocalRepository {
  async saveCurrentBusiness(business: LocalBusiness): Promise<void> {
    const current = await db.business.toCollection().first();

    // Si ya existe y es el mismo negocio
    if (current?.id === business.id) {
      if (
        current.id === business.id &&
        current.name === business.name &&
        current.address === business.address &&
        current.latitude === business.latitude &&
        current.longitude === business.longitude
      ) {
        return;
      }

      await db.business.put(business);

      return;
    }
    await db.business.clear();

    await db.business.put(business);
  }

  async getCurrentBusiness(): Promise<LocalBusiness | undefined> {
    return await db.business.toCollection().first();
  }
}
