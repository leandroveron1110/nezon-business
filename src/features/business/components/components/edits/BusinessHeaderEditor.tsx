// src/components/business/BusinessHeaderEditor.tsx
"use client";

import { useState } from "react";
import { Image, X, Save, UploadCloud } from "lucide-react";
import { useFileUploader } from "@/features/business/hooks/useImageUploader";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { getDisplayErrorMessage } from "@/lib/uiErrors";

interface BusinessHeaderEditorProps {
  businessId: string; // Agregamos el businessId
  logoUrl?: string;
  name: string;
  shortDescription?: string;
  fullDescription?: string;
  onCancel: () => void;
  onSave: (data: {
    logoUrl?: string;
    name: string;
    shortDescription?: string;
    fullDescription?: string;
  }) => void;
}

const MAX_SHORT_DESC = 60;

export default function BusinessHeaderEditor({
  businessId, // Lo desestructuramos aquí
  logoUrl,
  name,
  shortDescription,
  fullDescription,
  onCancel,
  onSave,
}: BusinessHeaderEditorProps) {
  const [formData, setFormData] = useState({
    logoUrl,
    name,
    shortDescription,
    fullDescription,
  });

  // Usamos el hook y le pasamos la URL del endpoint para el logo
  const { uploadFile, isUploading } = useFileUploader(businessId);

  const { addAlert } = useAlert()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "shortDescription" && value.length > MAX_SHORT_DESC) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    try {
      // Llamamos al hook para subir el archivo
      const data = await uploadFile(file);

      if(data){
        setFormData((prev) => ({ ...prev, logoUrl: data.url }));
      }
    } catch (err) {
      addAlert({
        message: getDisplayErrorMessage(err),
        type: 'error'
      })
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

return (
  <form
    onSubmit={handleSubmit}
    className="space-y-8"
  >
    {/* Identidad */}
    <section className="rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="font-semibold text-gray-900">
          Identidad del negocio
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Información principal que verán los clientes.
        </p>
      </div>

      <div className="space-y-8 p-6">
        {/* Logo */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Logo
          </label>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt="Logo"
                className="h-24 w-24 rounded-2xl border border-gray-200 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
            )}

            <div className="space-y-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                <UploadCloud className="h-4 w-4" />

                {isUploading
                  ? "Subiendo imagen..."
                  : "Cambiar logo"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              <p className="text-sm text-gray-500">
                PNG o JPG. Recomendado 512×512 px.
              </p>
            </div>
          </div>
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Nombre del negocio
          </label>

          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="
              w-full rounded-xl border border-gray-300
              px-4 py-3
              transition
              focus:border-gray-900
              focus:outline-none
              focus:ring-2
              focus:ring-gray-900/10
            "
          />
        </div>
      </div>
    </section>

    {/* Descripciones */}
    <section className="rounded-2xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="font-semibold text-gray-900">
          Descripción
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Ayuda a los clientes a entender qué ofrece tu negocio.
        </p>
      </div>

      <div className="space-y-6 p-6">
        {/* Descripción corta */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Descripción corta
            </label>

            <span className="text-xs text-gray-500">
              {formData.shortDescription?.length ?? 0}/{MAX_SHORT_DESC}
            </span>
          </div>

          <input
            type="text"
            name="shortDescription"
            value={formData.shortDescription || ""}
            onChange={handleChange}
            placeholder="Ej: Hamburguesas artesanales en el centro."
            className="
              w-full rounded-xl border border-gray-300
              px-4 py-3
              transition
              focus:border-gray-900
              focus:outline-none
              focus:ring-2
              focus:ring-gray-900/10
            "
          />

          <p className="text-sm text-gray-500">
            Se utiliza en búsquedas y listados.
          </p>
        </div>

        {/* Descripción larga */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Descripción completa
          </label>

          <textarea
            rows={6}
            name="fullDescription"
            value={formData.fullDescription || ""}
            onChange={handleChange}
            placeholder="Describe tu negocio, especialidades, historia, productos o cualquier información útil para tus clientes."
            className="
              w-full rounded-xl border border-gray-300
              px-4 py-3
              transition
              focus:border-gray-900
              focus:outline-none
              focus:ring-2
              focus:ring-gray-900/10
              resize-none
            "
          />
        </div>
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
        disabled={isUploading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white transition hover:bg-black disabled:opacity-50"
      >
        <Save className="h-4 w-4" />

        {isUploading
          ? "Guardando..."
          : "Guardar cambios"}
      </button>
    </div>
  </form>
);
}