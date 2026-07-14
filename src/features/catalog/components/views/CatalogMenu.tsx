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
    state.menus.find((m) => m.id === menuId),
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
      const createdSection =
        await createSectionMutation.mutateAsync(newSection);
      if (createdSection) {
        replaceTempId(
          "section",
          { menuId: menu.id },
          tempId,
          createdSection.id,
        );

        updateSection(
          { menuId: menuId, sectionId: createdSection.id },
          createdSection,
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
    <>
      <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <header className="flex flex-col gap-6 border-b border-gray-200 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Menú
            </span>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
              {menu.name}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>
                <strong className="font-semibold text-gray-800">
                  {sortedSections.length}
                </strong>{" "}
                secciones
              </span>

              <span className="h-1 w-1 rounded-full bg-gray-300" />

              <span>
                <strong className="font-semibold text-gray-800">
                  {sortedSections.reduce(
                    (total, section) => total + section.products.length,
                    0,
                  )}
                </strong>{" "}
                productos
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowEditMenuModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Editar menú
          </button>
        </header>

        {/* Contenido */}
        <div className="space-y-10 p-6 md:p-8">
          {sortedSections.length > 0 ? (
            <>
              {sortedSections.map((section) => (
                <CatalogSection
                  key={section.id}
                  sectionId={section.id}
                  businessId={businessId}
                  ownerId={ownerId}
                  menuId={menu.id}
                />
              ))}

              <div className="border-t border-dashed border-gray-300 pt-8">
                <NewCatalogSection
                  businessId={businessId}
                  menuId={menu.id}
                  ownerId={ownerId}
                  onAddSection={handleAddSection}
                  currentIndex={menu.sections?.length || 1}
                />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-8 py-16 text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Este menú todavía no tiene secciones
              </h3>

              <p className="mt-2 text-gray-500">
                Crea la primera sección para comenzar a organizar tus productos.
              </p>

              <div className="mt-8 flex justify-center">
                <NewCatalogSection
                  businessId={businessId}
                  menuId={menu.id}
                  ownerId={ownerId}
                  onAddSection={handleAddSection}
                  currentIndex={1}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {showEditMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <EditCatalogMenu
              name={menu.name}
              ownerId={ownerId}
              onSave={handleSaveMenu}
              onCancel={() => setShowEditMenuModal(false)}
              onDelete={() => console.log("Eliminar menú")}
            />
          </div>
        </div>
      )}
    </>
  );
}
