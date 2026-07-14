"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import Image from "next/image";
import React, { useState } from "react";
import {
  Menu,
  X,
  ShoppingBag,
  Store,
  Package,
  Users,
  Settings,
  LucideProps,
} from "lucide-react";

import logo from "../../../app/Nezon.svg";

interface ILinks {
  href: (businessId: string) => string;
  label: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> &
      React.RefAttributes<SVGSVGElement>
  >;
}

export default function Header() {
  const pathname = usePathname();

  const { businessId } = useParams<{
    businessId?: string;
  }>();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links: ILinks[] = [
    {
      href: () => "/",
      label: "Negocios",
      icon: Store,
    },
    {
      href: (id) => `/business/${id}/orders`,
      label: "Órdenes",
      icon: ShoppingBag,
    },
    {
      href: (id) => `/business/${id}/products`,
      label: "Productos",
      icon: Package,
    },
    // {
    //   href: (id) => `/business/${id}/employees`,
    //   label: "Personal",
    //   icon: Users,
    // },
    {
      href: (id) => `/business/${id}/profile`,
      label: "Ajustes",
      icon: Settings,
    },
  ];

  const isBusinessContext = Boolean(businessId);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

          {/* Logo */}
          <div className="flex items-center gap-3">

            {isBusinessContext && (
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="rounded-xl p-2 transition hover:bg-gray-100 md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}

            <Link href="/">
              <Image
                src={logo}
                alt="Nezon"
                width={110}
                height={34}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop */}
          {isBusinessContext && businessId && (
            <nav className="hidden md:block">
              <ul className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1">

                {links.map((link) => {
                  const href = link.href(businessId);
                  const active = isActive(href);

                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all
                        ${
                          active
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:bg-white hover:text-gray-900"
                        }`}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>
      </header>

      {/* Mobile Menu */}

      {mobileMenuOpen && isBusinessContext && businessId && (
        <div className="border-b border-gray-200 bg-white shadow-lg md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4">
            <ul className="space-y-2">

              {links.map((link) => {
                const href = link.href(businessId);
                const active = isActive(href);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition
                      ${
                        active
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}

            </ul>
          </nav>
        </div>
      )}
    </>
  );
}