"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

import type { NavigationNode } from "./navigation.types";
import {
  getNodeHref,
  hasActiveChild,
  isNodeActive,
} from "./navigation.utils";

interface MobileNavigationNodeProps {
  node: NavigationNode;
  businessId: string;
  pathname: string;
  closeMenu: () => void;
  level?: number;
}

export function MobileNavigationNode({
  node,
  businessId,
  pathname,
  closeMenu,
  level = 0,
}: MobileNavigationNodeProps) {
  const hasChildren = Boolean(node.children?.length);

  const href = getNodeHref(
    node,
    businessId,
  );

  const active = isNodeActive(
    node,
    pathname,
    businessId,
  );

  const childActive = hasActiveChild(
    node,
    pathname,
    businessId,
  );

  const [open, setOpen] = useState(childActive);

  /**
   * Nodo hoja.
   */
  if (!hasChildren) {
    if (!href) {
      return null;
    }

    return (
      <Link
        href={href}
        onClick={closeMenu}
        className={`
          flex items-center gap-3 rounded-xl px-4 py-3
          transition
          ${level > 0 ? "ml-4" : ""}
          ${
            active
              ? "bg-gray-900 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }
        `}
      >
        <node.icon className="h-5 w-5" />

        <span>{node.label}</span>
      </Link>
    );
  }

  /**
   * Nodo padre.
   */
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`
          flex w-full items-center justify-between
          rounded-xl px-4 py-3
          transition
          ${
            active || childActive
              ? "bg-gray-100 text-gray-900"
              : "text-gray-700 hover:bg-gray-100"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <node.icon className="h-5 w-5" />

          <span>{node.label}</span>
        </div>

        <ChevronRight
          className={`
            h-5 w-5 transition-transform
            ${open ? "rotate-90" : ""}
          `}
        />
      </button>

      {open && (
        <div className="space-y-1">
          {node.children?.map((child) => (
            <MobileNavigationNode
              key={`${child.label}-${getNodeHref(child, businessId) ?? child.label}`}
              node={child}
              businessId={businessId}
              pathname={pathname}
              closeMenu={closeMenu}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}