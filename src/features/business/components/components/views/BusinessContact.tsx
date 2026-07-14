"use client";

import {
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  Globe,
  Facebook,
  Instagram,
} from "lucide-react";

interface BusinessContactProps {
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  websiteUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  onEdit?: () => void;
}

export default function BusinessContact({
  address,
  latitude,
  longitude,
  email,
  phone,
  whatsapp,
  websiteUrl,
  facebookUrl,
  instagramUrl,
  onEdit,
}: BusinessContactProps) {
  const contacts = [
    address && {
      label: "Dirección",
      value: (
        <div>
          <span className="line-clamp-2 break-words" title={address}>
            {address}
          </span>
          {latitude !== undefined && longitude !== undefined && (
            <span className="block text-gray-400 text-xs mt-1">
              Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
            </span>
          )}
        </div>
      ),
      icon: <MapPin size={20} className="text-blue-600" />,
      link: null,
    },
    phone && {
      label: "Teléfono",
      value: phone,
      icon: <Phone size={20} className="text-green-600" />,
      link: `tel:${phone}`,
    },
    whatsapp && {
      label: "WhatsApp",
      value: whatsapp,
      icon: <MessageCircle size={20} className="text-green-500" />,
      link: `https://wa.me/${whatsapp.replace(/\D/g, "")}`,
      external: true,
    },
    email && {
      label: "Correo",
      value: email,
      icon: <Mail size={20} className="text-red-600" />,
      link: `mailto:${email}`,
    },
    websiteUrl && {
      label: "Sitio web",
      value: websiteUrl.replace(/^https?:\/\//, ""),
      icon: <Globe size={20} className="text-indigo-600" />,
      link: websiteUrl,
      external: true,
    },
    facebookUrl && {
      label: "Facebook",
      value: "Perfil de Facebook",
      icon: <Facebook size={20} className="text-blue-700" />,
      link: facebookUrl,
      external: true,
    },
    instagramUrl && {
      label: "Instagram",
      value: "Perfil de Instagram",
      icon: <Instagram size={20} className="text-pink-500" />,
      link: instagramUrl,
      external: true,
    },
  ].filter(Boolean);

  if (contacts.length === 0) return null;

return (
  <section className="rounded-2xl border border-gray-200 bg-white">
    {/* Header */}
    <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Información de contacto
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Datos visibles para los clientes.
        </p>
      </div>

      {onEdit && (
        <button
          onClick={onEdit}
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Editar información
        </button>
      )}
    </div>

    {/* Contenido */}
    <div className="divide-y divide-gray-100">
      {contacts.map(
        (contact, idx) =>
          contact && (
            <div
              key={idx}
              className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start"
            >
              {/* Icono */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                {contact.icon}
              </div>

              {/* Información */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">
                  {contact.label}
                </p>

                {contact.link ? (
                  <a
                    href={contact.link}
                    target={contact.external ? "_blank" : "_self"}
                    rel={
                      contact.external
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="mt-1 block break-all text-base font-medium text-gray-900 transition hover:text-blue-600"
                    title={
                      typeof contact.value === "string"
                        ? contact.value
                        : undefined
                    }
                  >
                    {contact.value}
                  </a>
                ) : (
                  <div className="mt-1 break-words text-base font-medium text-gray-900">
                    {contact.value}
                  </div>
                )}
              </div>
            </div>
          )
      )}
    </div>
  </section>
);
}
