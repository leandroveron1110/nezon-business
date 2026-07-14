"use client";

import { Star, Tag, ShoppingBag, Package, Users, Settings } from "lucide-react";
import { SearchResultBusiness } from "../../../types/search";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NotificationsBell } from "@/features/common/ui/NotificationsBell/NotificationsBell";
import { useBusinessNotificationsSocket } from "@/features/common/hooks/useBusinessNotificationsSocket";
import { useLocalBusiness } from "@/features/search/hooks/useLocalBusiness";

interface BusinessCardProps {
  business: SearchResultBusiness;
}

export const SearchBusinessCard = ({ business }: BusinessCardProps) => {
  const router = useRouter();
  useBusinessNotificationsSocket(business.id);

  const { saveBusiness } = useLocalBusiness();


  const openBusiness = async (
    path:string
  ) => {

    await saveBusiness(business);

    router.push(path);

  };
  

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative">
      
      {/* Notificaciones */}
      <div className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-md rounded-full p-1 shadow-sm border border-gray-100">
        <NotificationsBell businessId={business.id} />
      </div>

      {/* Cuerpo principal */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-4 mb-3">
            {/* Logo */}
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 shadow-inner">
              {business.logoUrl ? (
                <Image
                  src={business.logoUrl}
                  alt={business.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tag className="w-7 h-7 text-gray-400" />
                </div>
              )}
            </div>

            {/* Info principal */}
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-base font-bold text-gray-900 truncate">
                {business.name}
              </h3>

              <div className="flex items-center gap-2 mt-1">
                {business.isOpenNow !== undefined && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      business.isOpenNow
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {business.isOpenNow ? "Abierto" : "Cerrado"}
                  </span>
                )}

                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star size={12} className="fill-amber-400" />
                  <span className="text-xs font-semibold text-gray-700">
                    {business.averageRating?.toFixed(1) || "5.0"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {business.description && (
            <p className="text-gray-500 text-xs line-clamp-2 mb-3">
              {business.description}
            </p>
          )}
        </div>

        {/* Categorías */}
        {business.categoryNames && business.categoryNames.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {business.categoryNames.slice(0, 3).map((tag, index) => (
              <span
                key={tag + index}
                className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-md font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Botones de Navegación Rápida */}
      <div className="grid grid-cols-4 border-t border-gray-100 bg-gray-50/50 p-1">
        <button
          onClick={() => openBusiness(`/business/${business.id}/orders`)}
          className="flex flex-col items-center justify-center py-2.5 px-1 text-blue-600 hover:bg-blue-50/80 rounded-lg transition-colors gap-1"
          title="POS / Órdenes"
        >
          <ShoppingBag size={18} />
          <span className="text-[10px] font-semibold">POS</span>
        </button>

        <button
          onClick={() => openBusiness(`/business/${business.id}/products`)}
          className="flex flex-col items-center justify-center py-2.5 px-1 text-gray-600 hover:bg-gray-100/80 rounded-lg transition-colors gap-1"
          title="Productos"
        >
          <Package size={18} />
          <span className="text-[10px] font-medium">Productos</span>
        </button>

        <button
          onClick={() => openBusiness(`/business/${business.id}/employees`)}
          className="flex flex-col items-center justify-center py-2.5 px-1 text-gray-600 hover:bg-gray-100/80 rounded-lg transition-colors gap-1"
          title="Personal"
        >
          <Users size={18} />
          <span className="text-[10px] font-medium">Personal</span>
        </button>

        <button
          onClick={() => openBusiness(`/business/${business.id}/profile`)}
          className="flex flex-col items-center justify-center py-2.5 px-1 text-gray-600 hover:bg-gray-100/80 rounded-lg transition-colors gap-1"
          title="Ajustes"
        >
          <Settings size={18} />
          <span className="text-[10px] font-medium">Ajustes</span>
        </button>
      </div>
    </div>
  );
};