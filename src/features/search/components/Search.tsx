"use client";

import { useAuthStore } from "@/features/auth/store/authStore";
import { useBusinesses } from "../hooks/useBusinesses";
import { withSkeleton } from "@/features/common/utils/withSkeleton";
import SearchBusinessListSkeleton from "./skeleton/SearchBusinessListSkeleton";
import { useAlert } from "@/features/common/ui/Alert/Alert";
import { useEffect } from "react";
import { getDisplayErrorMessage } from "@/lib/uiErrors";
import { useInitialNotificationLoad } from "../hooks/useInitialNotificationLoad";
import { useRouter } from "next/navigation";
import SearchBusinessList from "./SearchBusinessList";

export default function SearchPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const businessIds = user?.businesses?.map((b) => b.id) || [];
  const { data, isLoading, isError, error } = useBusinesses(businessIds);

  useInitialNotificationLoad(businessIds);

  const { addAlert } = useAlert();

  useEffect(() => {
    if (isError) {
      addAlert({
        message: getDisplayErrorMessage(error),
        type: "error",
      });
    }
  }, [isError, error, addAlert]);

  // 🚀 REDIRECCIÓN AUTOMÁTICA AL POS SI TIENE SOLO 1 NEGOCIO
  // useEffect(() => {
  //   if (data?.data && data.data.length === 1) {
  //     const singleBusinessId = data.data[0].id;
  //     router.replace(`/business/${singleBusinessId}/orders`);
  //   }
  // }, [data, router]);

  if (isLoading || (data?.data && data.data.length === 1)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-gray-500">
          {data?.data?.length === 1 ? "Redirigiendo a tu local..." : "Cargando negocios..."}
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500 font-medium">Error al cargar las unidades de negocio</p>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2">
        <p className="text-gray-500 text-lg font-medium">No tenés negocios asociados</p>
        <p className="text-gray-400 text-sm">Contactá al administrador si creés que es un error.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tus Negocios</h1>
        <p className="text-sm text-gray-500">Seleccioná un local para gestionar el POS, productos o configuración.</p>
      </div>
      <SearchBusinessList businesses={data.data} />
    </div>
  );
}