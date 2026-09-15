// navigation.utils.ts

import type { NavigationNode } from "./navigation.types";

export function getNodeHref(
  node: NavigationNode,
  businessId: string,
): string | null {
  if (!node.href) return null;

  return node.href(businessId);
}

export function isNodeActive(
  node: NavigationNode,
  pathname: string,
  businessId: string,
): boolean {
  const href = getNodeHref(node, businessId);

  if (href) {
    const isRoot = href === "/";

    if (isRoot) {
      return pathname === "/";
    }

    if (pathname.startsWith(href)) {
      return true;
    }
  }

  return node.children?.some((child) =>
    isNodeActive(child, pathname, businessId),
  ) ?? false;
}

export function hasActiveChild(
  node: NavigationNode,
  pathname: string,
  businessId: string,
): boolean {
  return node.children?.some((child) =>
    isNodeActive(child, pathname, businessId),
  ) ?? false;
}