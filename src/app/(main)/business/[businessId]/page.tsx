"use client";

import BusinessDashboard from "@/features/BusinessDashboard/BusinessDashboard";
import { syncCatalogIfNeeded } from "@/features/common/database/sync/product.sync";
import BackButton from "@/features/common/ui/BackButton/BackButton";
import Header from "@/features/header/components/Header";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function BusinessPage() {
  const params = useParams<{ businessId: string }>();
  const businessId = params.businessId;

  /**
   * Gestiona la sincronización inicial de la materia prima (productos)
   * en la base de datos local (IndexedDB).
   */
  useEffect(() => {
    if (businessId) {
      // Se ejecuta de forma asíncrona en segundo plano
      syncCatalogIfNeeded(businessId);
    }
  }, [businessId]);

  if (!businessId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Business no encontrado</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto mb-6">
          <BackButton />
        </div>
        <BusinessDashboard businessId={businessId} />
        {/* Podés agregar más componentes que reciban businessId aquí */}
      </div>
    </>
  );
}
