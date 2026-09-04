"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const items = [
  {
    label: "Resumen",
    href: "summary",
  },
  {
    label: "Ventas",
    href: "sales",
  },
  // {
  //   label: "Productos",
  //   href: "products",
  // },
  // {
  //   label: "Gastos",
  //   href: "expenses",
  // },
  // {
  //   label: "Rentabilidad",
  //   href: "profitability",
  // },
  // {
  //   label: "Personal",
  //   href: "staff",
  // },
  // {
  //   label: "Reportes",
  //   href: "reports",
  // },
];

export default function AdministrationNavigation() {
  const pathname = usePathname();
  const params = useParams();

  const businessId = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;

  const basePath = `/business/${businessId}/admin`;

  return (
    <div className="border-b bg-white">
      <div className="flex gap-2 overflow-x-auto px-4">
        {items.map((item) => {
          const href = item.href
            ? `${basePath}/${item.href}`
            : basePath;

          const active =
            item.href === ""
              ? pathname === basePath
              : pathname.startsWith(href);

          return (
            <Link
              key={item.href}
              href={href}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
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