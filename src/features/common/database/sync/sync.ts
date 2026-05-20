// src/common/database/sync.ts

import { IMenu } from "@/features/catalog/types/catlog";
import { apiGet, ApiResult } from "@/lib/apiFetch";
import { fetchCatalogByBusinessID } from "@/features/catalog/api/catalog-api";
import { syncCatalog } from "./product.sync"; // Tu función que mapea a LocalProduct
import { db } from "@/mini-back/infrastructure/dexie/db";

/**
 * Obtiene el catálogo desde IndexedDB para una carga instantánea
 */
export const getCatalogSnapshot = async (): Promise<IMenu[]> => {
  const record = await db.deliveryConfig.get("catalog_full_snapshot");

  // Si el registro existe y su ID coincide, TS reconoce que tiene la propiedad 'data'
  if (record && record.id === "catalog_full_snapshot") {
    return record.data;
  }

  return [];
};

export const syncCatalogIfNeeded = async (
  businessId: string,
  onUpdate?: (data: IMenu[]) => void,
) => {
  try {
    const config = await db.deliveryConfig.get("catalog_metadata");
    if (!config) {
      const catalogData = await fetchCatalogByBusinessID(businessId);

      if (catalogData) {
        // GUARDADO DOBLE EN TRANSACCIÓN
        await db.transaction(
          "rw",
          [db.products, db.deliveryConfig],
          async () => {
            // 1. Materia prima (la lógica que ya tenías en product.sync.ts)
            await syncCatalog(catalogData);

            // 2. Snapshot para la UI (Evita el dolor de cabeza de mapear)
            await db.deliveryConfig.put({
              id: "catalog_full_snapshot",
              data: catalogData,
              businessId,
            });

            // 3. Metadata
            await db.deliveryConfig.put({
              id: "catalog_metadata",
              lastUpdated: new Date(),
              businessId,
            } as any);
          },
        );

        console.log("✅ Nezon: DB Local sincronizada.");
        if (onUpdate) onUpdate(catalogData);
      }
    }
    if (config && config.id == "catalog_metadata") {
      const localVersion = config?.lastUpdated || "0";

      const serverInfo = await apiGet<ApiResult<{ lastUpdated: string }>>(
        `/menus/version/${businessId}`,
      );
      const lastUpdated = serverInfo.data?.lastUpdated;

      if (lastUpdated && lastUpdated === localVersion) {
        console.log("🚀 Nezon: Ya actualizado.");
        return;
      }

      const catalogData = await fetchCatalogByBusinessID(businessId);

      if (catalogData) {
        // GUARDADO DOBLE EN TRANSACCIÓN
        await db.transaction(
          "rw",
          [db.products, db.deliveryConfig],
          async () => {
            // 1. Materia prima (la lógica que ya tenías en product.sync.ts)
            await syncCatalog(catalogData);

            // 2. Snapshot para la UI (Evita el dolor de cabeza de mapear)
            await db.deliveryConfig.put({
              id: "catalog_full_snapshot",
              data: catalogData,
              businessId,
            });

            // 3. Metadata
            await db.deliveryConfig.put({
              id: "catalog_metadata",
              lastUpdated: lastUpdated,
              businessId,
            } as any);
          },
        );

        console.log("✅ Nezon: DB Local sincronizada.");
        if (onUpdate) onUpdate(catalogData);
      }
    }
  } catch (error) {
    console.error("Error en sincronización", error);
  }
};
