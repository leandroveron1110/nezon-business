"use client";

import MapClientWrapper from "@/features/locationSelector/components/MapClientWrapper";
import { AddressData } from "@/features/locationSelector/types/address-data";
import { useState } from "react";

interface BusinessContactEditorProps {
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  onCancel: () => void;
  onSave: (data: {
    address?: string;
    addressData?: AddressData;
    phone?: string;
    whatsapp?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    websiteUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
  }) => void;
}

export default function BusinessContactEditor({
  address,
  phone,
  whatsapp,
  email,
  websiteUrl,
  facebookUrl,
  instagramUrl,
  onCancel,
  onSave,
}: BusinessContactEditorProps) {
  const [formData, setFormData] = useState({
    phone,
    whatsapp,
    email,
    websiteUrl,
    facebookUrl,
    instagramUrl,
  });

  const [editingAddress, setEditingAddress] = useState(false);
  const [addressData, setAddressData] = useState<AddressData | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapSave = (data: AddressData) => {
    setAddressData(data);
    setEditingAddress(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      ...formData,
      ...(addressData
        ? {
            address: `${addressData.street} ${addressData.number || ""}, ${addressData.city}`,
            latitude: addressData.latitude,
            longitude: addressData.longitude,
          }
        : {}),
    });
  };

  const resolvedAddress = addressData
    ? `${addressData.street} ${addressData.number || ""}, ${addressData.city}`
    : address;

return (
  <>
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Dirección */}
      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold text-gray-900">
            Dirección
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Ubicación física del negocio.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Dirección actual
            </label>

            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-gray-900"
                  title={resolvedAddress}
                >
                  {resolvedAddress}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingAddress(true)}
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cambiar ubicación
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Información de contacto */}
      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold text-gray-900">
            Información de contacto
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Datos visibles para los clientes.
          </p>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          {[
            {
              label: "Teléfono",
              name: "phone",
              type: "text",
              placeholder: "Ej: +54 3442 123456",
            },
            {
              label: "WhatsApp",
              name: "whatsapp",
              type: "text",
              placeholder: "Ej: +54 3442 123456",
            },
            {
              label: "Email",
              name: "email",
              type: "email",
              placeholder: "Ej: contacto@empresa.com",
            },
            {
              label: "Sitio web",
              name: "websiteUrl",
              type: "text",
              placeholder: "https://...",
            },
            {
              label: "Facebook",
              name: "facebookUrl",
              type: "text",
              placeholder: "https://facebook.com/...",
            },
            {
              label: "Instagram",
              name: "instagramUrl",
              type: "text",
              placeholder: "https://instagram.com/...",
            },
          ].map((field) => (
            <div
              key={field.name}
              className="space-y-2"
            >
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>

              <input
                type={field.type}
                name={field.name}
                value={formData[field.name as keyof typeof formData] || ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="
                  w-full rounded-xl border border-gray-300
                  px-4 py-3
                  text-sm
                  transition
                  focus:border-gray-900
                  focus:outline-none
                  focus:ring-2
                  focus:ring-gray-900/10
                "
              />
            </div>
          ))}
        </div>
      </section>

      {/* Acciones */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="rounded-xl bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-black"
        >
          Guardar cambios
        </button>
      </div>
    </form>

    {editingAddress && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-md">
        <div className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Seleccionar dirección
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Busca una dirección o mueve el marcador en el mapa.
              </p>
            </div>

            <button
              onClick={() => setEditingAddress(false)}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <MapClientWrapper onSave={handleMapSave} />
          </div>
        </div>
      </div>
    )}
  </>
);
}
