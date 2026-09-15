"use client";

import Link from "next/link";
import { Store } from "lucide-react";

import type { NavigationNode } from "./navigation.types";
import { MobileNavigationNode } from "./MobileNavigationNode";

interface MobileNavigationProps {
  nodes: NavigationNode[];
  businessId: string;
  pathname: string;
  closeMenu: () => void;
}

export function MobileNavigation({
  nodes,
  businessId,
  pathname,
  closeMenu,
}: MobileNavigationProps) {
  return (
    <div className="border-b border-gray-200 bg-white shadow-lg md:hidden">
      <nav className="mx-auto max-w-7xl px-4 py-4">
        <div className="space-y-2">
          {nodes.map((node) => (
            <MobileNavigationNode
              key={node.label}
              node={node}
              businessId={businessId}
              pathname={pathname}
              closeMenu={closeMenu}
            />
          ))}
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <Link
            href="/"
            onClick={closeMenu}
            className="
              flex items-center gap-3 rounded-xl
              px-4 py-3 text-gray-700
              transition hover:bg-gray-100
            "
          >
            <Store className="h-5 w-5" />

            <span>Negocios</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}