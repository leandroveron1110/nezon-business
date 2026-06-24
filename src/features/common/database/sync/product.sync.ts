// src/common/database/product.sync.ts

import { IMenu, IOption, IOptionGroup } from "@/features/catalog/types/catlog";

import { apiGet, ApiResult } from "@/lib/apiFetch";
import { fetchCatalogByBusinessID } from "@/features/catalog/api/catalog-api";
import { LocalOptionGroup, LocalProduct } from "@/mini-back/infrastructure/dexie/shcema/products.schema";
import { db } from "@/mini-back/infrastructure/dexie/db";

/**
 * Transforma el catálogo de la API de Nezon al formato de IndexedDB
 */

export const syncCatalog = async (menus: IMenu[]) => {
  try {
    const productsToStore: LocalProduct[] = [];

    for (const menu of menus) {
      for (const section of menu.sections) {
        for (const product of section.products) {
          
          // 1. Mapeo de Grupos de Opciones
          const mappedGroups: LocalOptionGroup[] = product.optionGroups.map((group) => ({
            id: group.id,
            name: group.name,
            minQuantity: group.minQuantity,
            maxQuantity: group.maxQuantity,
            options: group.options.map((opt) => ({
              id: opt.id,
              name: opt.name,
              priceFinal: Number(opt.priceFinal), 
              hasStock: opt.hasStock
            }))
          }));

          // 2. Extracción de Categorías (Tabla intermedia MenuProductFoodCategory)
          // Asumimos que el IMenuProduct trae las categorías pobladas

          // 3. Objeto final para IndexedDB
          const localProduct: LocalProduct = {
            id: product.id,
            name: product.name,
            description: product.description,
            finalPrice: Number(product.finalPrice),
            sectionName: section.name, // Nombre de la sección para el buscador
            imageUrl: product.imageUrl || undefined,
            stock: product.stock ?? 0,
            available: product.available && product.enabled,
            optionGroups: mappedGroups,
          };

          productsToStore.push(localProduct);
        }
      }
    }

    // Guardado masivo atómico en NezonBusinessDB
    await db.transaction('rw', db.products, async () => {
      await db.products.clear();
      await db.products.bulkPut(productsToStore);
    });

    // console.log(`🚀 Nezon: Materia prima cargada (${productsToStore.length} productos)`);
  } catch (error) {
    console.error("❌ Error en sincronización:", error);
    throw error;
  }
};

// src/common/database/sync.ts

export const syncCatalogIfNeeded = async (businessId: string) => {
  try {
    // 1. Obtener el 'timestamp' o 'version' actual de nuestra DB local
    const config = await db.deliveryConfig.get('catalog_metadata');
    if(config && config.id === 'catalog_metadata') {
      const localVersion = config?.lastUpdated || "0";
  
      // 2. Hacer un HEAD o un GET liviano al back para ver si hubo cambios
      // Podés tener un endpoint /menus/business/version/${businessId}
      const serverInfo = await apiGet<ApiResult<{ lastUpdated: string }>>(`/menus/version/${businessId}`);
      
      const lastUpdated = serverInfo.data?.lastUpdated
      // 3. Comparar. Si es igual, no hacemos nada.
      if (lastUpdated && lastUpdated === localVersion) {
        // console.log("🚀 Nezon: El catálogo ya está actualizado.");
        return;
      }
  
  
      // 4. Si es distinto, recién ahí bajamos todo el peso
      const catalogData = await fetchCatalogByBusinessID(businessId);
      
      if (catalogData) {
        await syncCatalog(catalogData);
        
        // 5. Actualizamos nuestra marca de tiempo local
        await db.deliveryConfig.put({
          id: 'catalog_metadata',
          lastUpdated: lastUpdated,
          businessId,
          companies: [], // mantenemos lo que ya estaba o actualizamos
          availableZones: []
        } as any);
      }

    }
  } catch (error) {
    console.error("Error en el check de sincronización", error);
  }
};