// src/lib/hooks/useUserDataSync.ts (Nuevo hook)
import { useEffect, useRef, useCallback } from "react";
import { useAlert } from "@/features/common/ui/Alert/Alert"; 
import { getDisplayErrorMessage } from "@/lib/uiErrors";

// --- Tipos de Opciones para la versión de un solo usuario ---

/**
 * Define la estructura de las opciones requeridas para el hook useUserDataSync.
 * Ya no requiere el argumento 'id' en los selectores/acciones.
 * @template T Debe ser un tipo que incluya la propiedad 'id: string'.
 */
export interface UserSyncOptions<T extends { id: string }> {
  /** Devuelve el último tiempo de sincronización guardado (sin argumento ID). */
  getLastSyncTime: () => string | undefined;

  /** Devuelve los ítems actuales almacenados (sin argumento ID). */
  getItems: () => T[];

  /** Actualiza los ítems sincronizados (lista fusionada) y el nuevo timestamp. */
  setSyncedItems: (items: T[], latestTimestamp: string) => void;

  /** * Llama a la API correspondiente. 
   * Solo requiere el último tiempo de sincronización.
   */
  fetchUpdatedItems: (
    lastSyncTime: string | undefined
  ) => Promise<{ items: T[]; latestTimestamp: string }>;

  /** Solo para debug/logs */
  entityName: string;
}

// --- Hook Principal ---

/**
 * Hook personalizado para manejar la sincronización de datos de una entidad única (ej. las órdenes del usuario).
 * @param options Opciones de sincronización que incluyen getters, setters y la función de la API.
 * @returns Un objeto con la función `syncData` para forzar la sincronización.
 */
export function useUserDataSync<T extends { id: string }>({
  getLastSyncTime,
  getItems,
  setSyncedItems,
  fetchUpdatedItems,
  entityName,
}: UserSyncOptions<T>) {
  const { addAlert } = useAlert();
  const isSyncingRef = useRef(false);

  const syncData = useCallback(async () => {
    // 1. Prevenir ejecución doble
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    // Obtener el último tiempo de sincronización conocido (sin pasar ID)
    const lastSyncTime = getLastSyncTime();
    // console.log(`[Sync ${entityName}] Iniciando sincronización. (Último: ${lastSyncTime ?? "N/A"})`);

    try {
      // 2. Llamar a la API para obtener actualizaciones
      const { items: newOrUpdatedItems, latestTimestamp } = await fetchUpdatedItems(lastSyncTime);
      
      // Obtener el estado actual del store
      const currentItems = getItems();

      if (newOrUpdatedItems.length > 0) {
        // 3. Lógica de MERGE: Fusionar ítems actuales con los nuevos/actualizados

        // Crear un mapa con los ítems actuales usando su ID como clave
        const mergedMap = new Map<string, T>(currentItems.map((item) => [item.id, item]));
        
        // Sobrescribir o añadir los ítems nuevos/actualizados en el mapa
        newOrUpdatedItems.forEach((updated) => mergedMap.set(updated.id, updated));

        // Convertir el mapa de nuevo a un array
        const mergedArray = Array.from(mergedMap.values());
        
        // 4. Actualizar el Store con la lista fusionada y el nuevo timestamp
        setSyncedItems(mergedArray, latestTimestamp);

        // console.log(`[Sync ${entityName}] ${newOrUpdatedItems.length} elementos nuevos/actualizados. Total: ${mergedArray.length}`);
      } else {
        // 5. No hubo cambios: Actualizar SOLO el timestamp
        setSyncedItems(currentItems, latestTimestamp);
        // console.log(`[Sync ${entityName}] Sin cambios. Timestamp actualizado.`);
      }
    } catch (error) {
      // Manejo de errores
      addAlert({ message: getDisplayErrorMessage(error), type: "error" });
    } finally {
      // Liberar el flag de sincronización
      isSyncingRef.current = false;
    }
  }, [
    getLastSyncTime,
    getItems,
    setSyncedItems,
    fetchUpdatedItems,
    addAlert,
    entityName,
  ]);

  // Ejecutar la sincronización al montar el componente (solo una vez)
  useEffect(() => {
    void syncData(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* Se ejecuta solo al montar, ya que no depende de IDs externos */]);

  return { syncData };
}