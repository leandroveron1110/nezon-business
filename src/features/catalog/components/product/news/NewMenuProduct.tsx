// src/features/business/catalog/product/NewMenuProduct.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { IMenuProduct, MenuProductCreate } from "../../../types/catlog";
import { useCreateMenuProduct } from "../../../hooks/useMenuHooks";
import MenuProductPrice from "../components/MenuProductPrice";
import MenuProductStock from "../components/MenuProductStock";
import MenuProductFlags from "../components/MenuProductFlags";
import EnabledSwitch from "../components/EnabledSwitch";
import { useMenuStore } from "../../../stores/menuStore";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { getDisplayErrorMessage } from "@/lib/uiErrors";
import { generateTempId } from "@/features/common/utils/utilities-rollback";

interface Props {
  menuId: string;
  sectionId: string;
  businessId: string;
  ownerId: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewMenuProduct({
  menuId,
  sectionId,
  businessId,
  ownerId,
  onClose,
}: Props) {
  const { addAlert } = useAlert();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [prices, setPrices] = useState({
    originalPrice: "",
    finalPrice: "",
    discountPercentage: "",
  });

  const [stock, setStock] = useState(1);
  const [available, setAvailable] = useState(true);
  const [enabled, setEnabled] = useState(true);

  const [flags, setFlags] = useState({
    isMostOrdered: false,
    isRecommended: false,
  });

  // 🆕 Métodos de pago del producto
  const [paymentMethods, setPaymentMethods] = useState({
    acceptsCash: true,
    acceptsTransfer: true,
    acceptsQr: false,
  });

  const createProduct = useCreateMenuProduct(businessId);
  const addProduct = useMenuStore((s) => s.addProduct);
  const replaceTempId = useMenuStore((s) => s.replaceTempId);
  const deleteProduct = useMenuStore((s) => s.deleteProduct);
  const updateProduct = useMenuStore((s) => s.updateProduct);

  const [saving, setSaving] = useState(false);

  // Autofocus en nombre
  const nameInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || Number(prices.finalPrice) <= 0) return;

    setSaving(true);

    const tempId = generateTempId();

    // Datos que se envían al servidor
    const newProductCreate: MenuProductCreate = {
      name,
      businessId,
      menuId,
      ownerId,
      description,
      enabled,
      originalPrice: prices.originalPrice,
      finalPrice: prices.finalPrice,
      discountPercentage: prices.discountPercentage,
      stock,
      available,
      isMostOrdered: flags.isMostOrdered,
      isRecommended: flags.isRecommended,
      hasOptions: false,
      seccionId: sectionId,
      imageUrl: undefined,

      // 🆕 MÉTODOS DE PAGO
      acceptsCash: paymentMethods.acceptsCash,
      acceptsTransfer: paymentMethods.acceptsTransfer,
      acceptsQr: paymentMethods.acceptsQr,
    };

    // Product optimista
    const optimisticProduct: IMenuProduct = {
      id: tempId,
      name,
      description,
      enabled,
      originalPrice: prices.originalPrice,
      finalPrice: prices.finalPrice,
      discountPercentage: prices.discountPercentage,
      stock,
      available,
      isMostOrdered: flags.isMostOrdered,
      isRecommended: flags.isRecommended,
      hasOptions: false,
      seccionId: sectionId,
      currency: "$",
      imageUrl: "",
      optionGroups: [],
      preparationTime: 0,

      // 🆕 Métodos de pago en store
      acceptsCash: paymentMethods.acceptsCash,
      acceptsTransfer: paymentMethods.acceptsTransfer,
      acceptsQr: paymentMethods.acceptsQr,
    };

    addProduct({ menuId, sectionId }, optimisticProduct);
    onClose();

    try {
      const created = await createProduct.mutateAsync(newProductCreate);

      if (created && created.id) {
        replaceTempId(
          "product",
          { menuId, sectionId },
          tempId,
          created.id
        );

        updateProduct(
          { menuId, productId: created.id, sectionId },
          created
        );

        addAlert({
          message: `Producto "${created.name}" creado con éxito.`,
          type: "success",
        });

        onClose();
      } else {
        throw new Error("Producto creado pero el ID real no fue devuelto.");
      }
    } catch (error) {
      deleteProduct({ menuId, sectionId, productId: tempId });

      addAlert({
        message: getDisplayErrorMessage(error),
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

return (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

    {/* Contenido */}
    <div className="space-y-8 p-6">
      {/* Información básica */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Información general
        </h3>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nombre
            </label>

            <input
              ref={nameInputRef}
              type="text"
              value={name}
              placeholder="Ej. Pizza Napolitana"
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Descripción
            </label>

            <textarea
              rows={4}
              value={description}
              placeholder="Describe brevemente el producto..."
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>
      </section>

      {/* Precio */}
      <section className="border-t border-gray-200 pt-8">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Precio
        </h3>

        <MenuProductPrice
          finalPrice={prices.finalPrice}
          discountPercentage={prices.discountPercentage}
          originalPrice={prices.originalPrice}
          onUpdate={(data) =>
            setPrices({
              finalPrice: `${data.finalPrice}`,
              originalPrice: `${data.originalPrice}`,
              discountPercentage: `${data.discountPercentage}`,
            })
          }
        />
      </section>

      {/* Disponibilidad */}
      <section className="border-t border-gray-200 pt-8">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Disponibilidad
        </h3>

        <div className="space-y-6">
          <MenuProductStock
            stock={stock}
            available={available}
            preparationTime={0}
            onUpdate={(data) => {
              if (data.stock !== undefined) setStock(data.stock);
              if (data.available !== undefined)
                setAvailable(data.available);
            }}
          />

          <EnabledSwitch
            enabled={enabled}
            onChange={setEnabled}
            label="Visible en la carta"
            hint="Los clientes podrán visualizar este producto."
          />
        </div>
      </section>

      {/* Destacados */}
      <section className="border-t border-gray-200 pt-8">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Destacados
        </h3>

        <MenuProductFlags
          isMostOrdered={flags.isMostOrdered}
          isRecommended={flags.isRecommended}
          onUpdate={(data) => setFlags(data)}
        />
      </section>

      {/* Métodos de pago */}
      <section className="border-t border-gray-200 pt-8">
        <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Métodos de pago
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          <EnabledSwitch
            enabled={paymentMethods.acceptsCash}
            onChange={(v) =>
              setPaymentMethods((p) => ({
                ...p,
                acceptsCash: v,
              }))
            }
            label="Efectivo"
            hint="Aceptar efectivo."
          />

          <EnabledSwitch
            enabled={paymentMethods.acceptsTransfer}
            onChange={(v) =>
              setPaymentMethods((p) => ({
                ...p,
                acceptsTransfer: v,
              }))
            }
            label="Transferencia"
            hint="Aceptar transferencias."
          />

          <EnabledSwitch
            enabled={paymentMethods.acceptsQr}
            onChange={(v) =>
              setPaymentMethods((p) => ({
                ...p,
                acceptsQr: v,
              }))
            }
            label="QR / Billeteras"
            hint="Aceptar Mercado Pago u otras billeteras."
          />
        </div>
      </section>
    </div>

    {/* Footer */}
    <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 sm:flex-row sm:justify-end">
      <button
        onClick={onClose}
        className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100"
      >
        Cancelar
      </button>

      <button
        onClick={handleCreate}
        disabled={
          saving ||
          !name.trim() ||
          Number(prices.finalPrice) <= 0
        }
        className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-2.5 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Creando..." : "Crear producto"}
      </button>
    </div>
  </div>
);
}
