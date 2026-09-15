"use client";

import type { NavigationNode } from "./navigation.types";
import { DesktopNavigationNode } from "./DesktopNavigationNode";

interface DesktopNavigationProps {
  nodes: NavigationNode[];
  businessId: string;
  pathname: string;
}

export function DesktopNavigation({
  nodes,
  businessId,
  pathname,
}: DesktopNavigationProps) {
  return (
    <nav className="hidden md:block">
      <ul
        className="
          flex items-center gap-2
          rounded-2xl border border-gray-200
          bg-gray-50 p-1
        "
      >
        {nodes.map((node) => (
          <li key={node.label}>
            <DesktopNavigationNode
              node={node}
              businessId={businessId}
              pathname={pathname}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}