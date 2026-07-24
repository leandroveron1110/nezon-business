"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const items = [
  {
    label: "Caja",
    href: "current",
  },
  {
    label: "Historial",
    href: "history",
  },
  {
    label: "Gráficos",
    href: "analytics",
  },
  {
    label: "Reportes",
    href: "reports",
  },
];

export default function CashRegisterNavigation() {
  const pathname = usePathname();
  const params = useParams();

  const businessId = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;

  return (
    <div className="border-b bg-white">
      <div className="flex gap-2 px-4">
        {items.map((item) => {
          const href = `/business/${businessId}/cash-register/${item.href}`;
          const active = pathname === href;

          return (
            <Link
              key={item.href}
              href={href}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}