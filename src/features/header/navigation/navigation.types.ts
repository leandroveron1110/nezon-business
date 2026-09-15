// navigation.types.ts

import type { LucideIcon } from "lucide-react";

export type NavigationNode = {
  label: string;
  icon: LucideIcon;

  href?: (businessId: string) => string;

  children?: NavigationNode[];
};