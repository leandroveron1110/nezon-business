// navigation.config.ts

import {
  Calculator,
  ChartNoAxesCombined,
  Package,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";

import type { NavigationNode } from "./navigation.types";

export const navigationTree: NavigationNode[] = [
  {
    label: "Órdenes",
    icon: ShoppingBag,
    href: (businessId) => `/business/${businessId}/orders`,
  },

  {
    label: "Caja",
    icon: Calculator,
    children: [
      {
        label: "Apertura",
        icon: Calculator,
        href: (businessId) =>
          `/business/${businessId}/cash-register-turn/current`,
      },
      {
        label: "Historial",
        icon: Calculator,
        href: (businessId) =>
          `/business/${businessId}/cash-register-turn/hystory`,
      },
    ],
  },

  {
    label: "Productos",
    icon: Package,
    href: (businessId) => `/business/${businessId}/products`,
  },

  {
    label: "Administración",
    icon: ChartNoAxesCombined,
    href: (businessId) => `/business/${businessId}/admin`,

    children: [
      {
        label: "Resumen",
        icon: ChartNoAxesCombined,
        href: (businessId) => `/business/${businessId}/admin/summary`,
      },

      {
        label: "Tesorería",
        icon: Wallet,
        href: (businessId) => `/business/${businessId}/admin/treasury`,
      },

      {
        label: "Cajas físicas",
        icon: Calculator,
        href: (businessId) => `/business/${businessId}/admin/cash-register`,
      },

      {
        label: "Empleados",
        icon: Users,
        href: (businessId) => `/business/${businessId}/employees`,
      },
    ],
  },
];
