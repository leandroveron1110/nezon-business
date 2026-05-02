// src/features/catalog/components/Catalog.tsx

"use client";

import React, { useEffect, useState } from "react";
import CatalogMenu from "./views/CatalogMenu";
import { useAuthStore } from "@/features/auth/store/authStore";
import NewCatalogMenu from "./news/NewCatalogMenu";
import { IMenu, MenuCreate } from "../types/catlog";
import { useMenuStore } from "../stores/menuStore";
import { getDisplayErrorMessage } from "@/lib/uiErrors";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { useCreateMenu } from "../hooks/useMenuHooks";
import { generateTempId } from "@/features/common/utils/utilities-rollback";
import { getCatalogSnapshot, syncCatalogIfNeeded } from "@/features/common/database/sync/sync";

interface Props {
  businessId: string;
}

export default function Catalog({ businessId }: Props) {
  const { addAlert } = useAlert();
  const user = useAuthStore((state) => state.user);
  
  const menus = useMenuStore((state) => state.menus);
  const setMenus = useMenuStore((state) => state.setMenus);
  const replaceTempId = useMenuStore((state) => state.replaceTempId);
  const addMenu = useMenuStore((state) => state.addMenu);
  const deleteMenu = useMenuStore((state) => state.deleteMenu);

  const [isHydrated, setIsHydrated] = useState(false);
  const createMenuMutation = useCreateMenu(businessId);

  useEffect(() => {
    const initCatalog = async () => {
      // 1. HIDRATACIÓN: Intentar cargar lo que ya hay en IndexedDB
      const cachedData = await getCatalogSnapshot();
      if (cachedData.length > 0) {
        setMenus(cachedData);
      }
      setIsHydrated(true); // Ya podemos mostrar la UI aunque sea con data vieja

      // 2. SINCRONIZACIÓN: Verificar si hay novedades en el back
      await syncCatalogIfNeeded(businessId, (newData) => {
        // Solo si hubo cambios reales, actualizamos el store y la UI
        setMenus(newData);
      });
    };

    if (businessId) {
      initCatalog();
    }
  }, [businessId, setMenus]);

  const handleAddMenu = async (menuCreate: MenuCreate) => {
    const tempId = generateTempId();
    const optimisticMenu: IMenu = {
      id: tempId,
      businessId: menuCreate.businessId,
      name: menuCreate.name,
      sections: [],
    };

    addMenu(optimisticMenu);

    try {
      const newMenu = await createMenuMutation.mutateAsync(menuCreate);
      if (newMenu && newMenu.id) {
        replaceTempId("menu", {}, tempId, newMenu.id);
        addAlert({ message: `Menú "${newMenu.name}" creado.`, type: "success" });
        
        // OPCIONAL: Podrías disparar un syncCatalogIfNeeded aquí para 
        // que IndexedDB guarde este nuevo menú localmente.
      } else {
        throw new Error("ID no devuelto");
      }
    } catch (err) {
      deleteMenu(tempId);
      addAlert({
        message: `No se pudo crear: ${getDisplayErrorMessage(err)}`,
        type: "error",
      });
    }
  };

  // Solo mostramos loader si NO estamos hidratados Y el store está vacío
  if (!isHydrated && menus.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500 text-lg font-medium animate-pulse">
          Accediendo a Nezon...
        </p>
      </div>
    );
  }

  return (
    <div className="pb-25">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-16">
          {menus && menus.length > 0 ? (
            <>
              {menus.map((menu) => (
                <CatalogMenu
                  key={menu.id}
                  businessId={businessId}
                  menuId={menu.id}
                  ownerId={user?.id || ""}
                />
              ))}
              <NewCatalogMenu
                businessId={businessId}
                ownerId={user?.id || ""}
                onAddMenu={handleAddMenu}
              />
            </>
          ) : (
            <div className="text-center py-20 text-gray-600">
              <p className="mb-4">No hay catálogos disponibles.</p>
              <NewCatalogMenu
                businessId={businessId}
                ownerId={user?.id || ""}
                onAddMenu={handleAddMenu}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}