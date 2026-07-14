"use client";

import React, { useCallback, useMemo, useState } from "react";
import MenuProduct from "../product/MenuProduct";
import { IMenuProduct, IMenuSectionWithProducts } from "../../types/catlog";
import NewMenuProduct from "../product/news/NewMenuProduct";
import EditCatalogSection from "../edits/EditCatalogSection";
import { useMenuStore } from "../../stores/menuStore";
import { Plus, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import CatalogProduct from "./CatalogProduct";

interface Props {
  menuId: string;
  sectionId: string;
  businessId: string;
  ownerId: string;
  onSectionChange: (s: Partial<IMenuSectionWithProducts>) => void;
  onSectionDelete: (id: string) => void;
}

export default function ViewCatalogSection({
  sectionId,
  menuId,
  businessId,
  ownerId,
  onSectionChange,
  onSectionDelete,
}: Props) {
  const [selectedProduct, setSelectedProduct] = useState<IMenuProduct | null>(
    null
  );
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const section = useMenuStore((state) =>
    state.menus
      .find((m) => m.id === menuId)
      ?.sections.find((s) => s.id === sectionId)
  );

  const sortedProducts = useMemo(() => {
    if (!section) {
      return [];
    }
    return [...section.products];
  }, [section]);

  const handleSelectProduct = useCallback((product: IMenuProduct) => {
    setSelectedProduct(product);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const handleProductCreated = () => {
    setShowNewProductModal(false);
  };

  const handleSectionSave = (data: {
    section: Partial<IMenuSectionWithProducts>;
  }) => {
    onSectionChange(data.section);
    setShowEditSectionModal(false);
  };

  const handleSectionDelete = (id: string) => {
    onSectionDelete(id);
    setShowEditSectionModal(false);
  };

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  if (!section) return <div />;

return (
  <>
    <section className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-5 border-b border-gray-200 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-gray-900">
            {section.name}
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {sortedProducts.length}{" "}
            {sortedProducts.length === 1 ? "producto" : "productos"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sortedProducts.length > 0 && (
            <button
              onClick={handleToggleCollapse}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              {isCollapsed ? (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Expandir
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Contraer
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setShowEditSectionModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
        </div>
      </header>

      {!isCollapsed &&
        (sortedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sortedProducts.map((product) => (
                <CatalogProduct
                  key={product.id}
                  product={product}
                  onClick={() => handleSelectProduct(product)}
                />
              ))}
            </div>

            <div className="border-t border-dashed border-gray-300 pt-8">
              <button
                onClick={() => setShowNewProductModal(true)}
                className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 transition hover:border-gray-400 hover:bg-gray-100"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:scale-110">
                  <Plus className="h-7 w-7 text-gray-700" />
                </div>

                <span className="mt-4 text-base font-semibold text-gray-900">
                  Agregar producto
                </span>

                <span className="mt-1 text-sm text-gray-500">
                  Incorpora un nuevo producto a esta sección.
                </span>
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-8 py-16 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Esta sección está vacía
            </h3>

            <p className="mt-2 text-gray-500">
              Agrega el primer producto para comenzar.
            </p>

            <button
              onClick={() => setShowNewProductModal(true)}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-white transition hover:bg-black"
            >
              <Plus className="h-5 w-5" />
              Agregar producto
            </button>
          </div>
        ))}
    </section>

    {selectedProduct && (
      <Modal onClose={handleCloseModal} title="Producto">
        <MenuProduct
          productId={selectedProduct.id}
          onClose={handleCloseModal}
          menuId={menuId}
          sectionId={sectionId}
          businessId={businessId}
        />
      </Modal>
    )}

    {showNewProductModal && (
      <Modal
        onClose={() => setShowNewProductModal(false)}
        title="Nuevo producto"
      >
        <NewMenuProduct
          sectionId={section.id}
          onClose={() => setShowNewProductModal(false)}
          onCreated={handleProductCreated}
          businessId={businessId}
          menuId={menuId}
          ownerId={ownerId}
        />
      </Modal>
    )}

    {showEditSectionModal && (
      <Modal
        onClose={() => setShowEditSectionModal(false)}
        title="Editar sección"
      >
        <EditCatalogSection
          section={section}
          onUpdate={handleSectionSave}
          onCancel={() => setShowEditSectionModal(false)}
          onDelete={handleSectionDelete}
        />
      </Modal>
    )}
  </>
);
}

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}

function Modal({
    children,
    onClose,
    title,
}: ModalProps) {
    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">

            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

                {/* Header */}
                <header className="flex items-center justify-between border-b border-gray-200 px-8 py-5 shrink-0">

                    <h2 className="text-xl font-semibold text-gray-900">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-gray-500 hover:bg-gray-100"
                    >
                        ✕
                    </button>

                </header>

                {/* Body */}
                <main className="flex-1 overflow-y-auto px-8 py-6">
                    {children}
                </main>

            </div>

        </div>
    );
}
