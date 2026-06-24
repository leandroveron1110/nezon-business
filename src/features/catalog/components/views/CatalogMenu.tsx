"use client";

import React, { useMemo, useState } from "react";
import { IMenuSectionWithProducts, SectionCreate } from "../../types/catlog";
import CatalogSection from "./CatalogSection";
import NewCatalogSection from "../news/NewCatalogSection";
import { useCreateSection, useUpdateMenu } from "../../hooks/useMenuHooks";
import EditCatalogMenu from "../edits/EditCatalogMenu";
import { useMenuStore } from "../../stores/menuStore";
import { Pencil } from "lucide-react";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { getDisplayErrorMessage } from "@/lib/uiErrors";
import { generateTempId } from "@/features/common/utils/utilities-rollback";

interface Props {
  businessId: string;
  menuId: string;
  ownerId: string;
}

export default function CatalogMenu({ menuId, ownerId, businessId }: Props) {
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);

  const menu = useMenuStore((state) =>
    state.menus.find((m) => m.id === menuId)
  );

  const updateMenuStore = useMenuStore((state) => state.updateMenu);
  const replaceTempId = useMenuStore((state) => state.replaceTempId);
  const deleteSection = useMenuStore((state) => state.deleteSection);

  const addSection = useMenuStore((state) => state.addSection);
  const updateSection = useMenuStore((state) => state.updateSection);
  const { addAlert } = useAlert();

  const createSectionMutation = useCreateSection(businessId);
  const updateMenuMutation = useUpdateMenu(businessId);

  const sortedSections = useMemo(() => {
    return menu
      ? [...(menu.sections ?? [])].sort((a, b) => a.index - b.index)
      : [];
  }, [menu]);

  const handleSaveMenu = async (newName: string) => {
    if (!menu) return;
    const prevMenuName = menu.name;
    const prevShowEditModal = showEditMenuModal;
    updateMenuStore(menu.id, {
      name: newName,
    });
    setShowEditMenuModal(false);

    try {
      const result = await updateMenuMutation.mutateAsync({
        menuId: menu.id,
        data: { name: newName, businessId, ownerId },
      });

      if (result) {
        updateMenuStore(menu.id, result);
        addAlert({
          message: `Menu actualizado`,
          type: "info",
        });
      } else {
        throw new Error(`No se pudo actualizar el menu`);
      }
    } catch (err) {
      updateMenuStore(menu.id, {
        name: prevMenuName,
      });
      setShowEditMenuModal(prevShowEditModal);
      addAlert({
        message: getDisplayErrorMessage(err),
        type: "error",
      });
    }
  };

  const handleAddSection = async (newSection: SectionCreate) => {
    if (!menu) return;
    const tempId = generateTempId();

    const optimisticSection: IMenuSectionWithProducts = {
      id: tempId,
      products: [],
      imageUrls: newSection.imageUrls,
      index: newSection.index,
      name: newSection.name,
    };

    addSection({ menuId: menu.id }, optimisticSection);
    try {
      const createdSection = await createSectionMutation.mutateAsync(
        newSection
      );
      if (createdSection) {
        replaceTempId(
          "section",
          { menuId: menu.id },
          tempId,
          createdSection.id
        );

        updateSection(
          { menuId: menuId, sectionId: createdSection.id },
          createdSection
        );
      } else {
        throw new Error(`No se pudo agrecar la seccion`);
      }
    } catch (err) {
      deleteSection({ menuId: menu.id, sectionId: tempId });
      addAlert({
        message: getDisplayErrorMessage(err),
        type: "error",
      });
    }
  };

  if (!menu) return null;

  return (
    <div className="bg-gray-50 ">
      <div className="bg-white">
        {/* Header con botón e ícono */}
        <header className="p-8 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
              {menu.name}
            </h2>
            <button
              onClick={() => setShowEditMenuModal(true)}
              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              aria-label="Editar Menú"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Contenedor de Secciones */}
        <div className="p-3 space-y-8">
          {sortedSections.map((section) => (
            <CatalogSection
              key={section.id}
              sectionId={section.id}
              businessId={businessId}
              ownerId={ownerId}
              menuId={menu.id}
            />
          ))}

          <NewCatalogSection
            businessId={businessId}
            menuId={menu.id}
            ownerId={ownerId}
            onAddSection={handleAddSection}
            currentIndex={menu.sections?.length || 1}
          />
        </div>
      </div>

      {showEditMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
            <EditCatalogMenu
              name={menu.name}
              ownerId={ownerId}
              onSave={handleSaveMenu}
              onCancel={() => setShowEditMenuModal(false)}
              onDelete={() =>  console.log("Eliminar menú")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
