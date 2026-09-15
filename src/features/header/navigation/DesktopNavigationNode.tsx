"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { NavigationNode } from "./navigation.types";
import {
  getNodeHref,
  hasActiveChild,
  isNodeActive,
} from "./navigation.utils";

interface DesktopNavigationNodeProps {
  node: NavigationNode;
  businessId: string;
  pathname: string;
}

export function DesktopNavigationNode({
  node,
  businessId,
  pathname,
}: DesktopNavigationNodeProps) {
  const [open, setOpen] = useState(false);

  const href = getNodeHref(node, businessId);
  const hasChildren = Boolean(node.children?.length);

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
        className={`
          flex items-center gap-2 rounded-xl px-4 py-2
          text-sm font-medium transition-all
          ${
            active
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:bg-white hover:text-gray-900"
          }
        `}
      >
        <node.icon className="h-4 w-4" />

        {node.label}
      </Link>
    );
  }

  /**
   * Nodo con hijos.
   */
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`
          flex items-center gap-2 rounded-xl px-4 py-2
          text-sm font-medium transition-all
          ${
            active || childActive
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:bg-white hover:text-gray-900"
          }
        `}
      >
        <node.icon className="h-4 w-4" />

        {node.label}

        <ChevronDown
          className={`
            h-4 w-4 transition-transform
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {open && (
        <div
          className="
            absolute right-0 top-full z-50 mt-2
            min-w-[210px]
            rounded-2xl border border-gray-200
            bg-white p-2 shadow-lg
          "
        >
          {node.children?.map((child) => {
            const childHref = getNodeHref(
              child,
              businessId,
            );

            if (!childHref) {
              return null;
            }

            const childIsActive = isNodeActive(
              child,
              pathname,
              businessId,
            );

            return (
              <Link
                key={`${child.label}-${childHref}`}
                href={childHref}
                className={`
                  flex items-center gap-3 rounded-xl px-3 py-2.5
                  text-sm transition
                  ${
                    childIsActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <child.icon className="h-4 w-4" />

                <span>{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}