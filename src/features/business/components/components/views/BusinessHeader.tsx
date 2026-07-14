"use client";

import Image from "next/image";
import { Globe, Pencil } from "lucide-react";

interface BusinessHeaderProps {
  logoUrl?: string;
  name: string;
  fullDescription?: string;
  onEdit?: () => void;
}

export default function BusinessHeader({
  logoUrl,
  name,
  fullDescription,
  onEdit,
}: BusinessHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white">

      {/* Imagen */}
      <div className="relative h-60 w-full md:h-72">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <Globe className="h-20 w-20 text-gray-300" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        {/* Botón editar */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-sm font-medium text-gray-800 backdrop-blur transition hover:bg-white"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </button>
        )}
      </div>

      {/* Información */}
      <div className="space-y-4 p-6 md:p-8">

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {name}
          </h1>

          {fullDescription && (
            <p className="mt-3 max-w-3xl text-base leading-7 text-gray-600">
              {fullDescription}
            </p>
          )}
        </div>

      </div>
    </header>
  );
}