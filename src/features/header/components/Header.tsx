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
  Settings,
  LucideProps,
} from "lucide-react";

import logo from "../../../app/Nezon.svg";
import { useCurrentBusiness } from "../hooks/useCurrentBusiness";

interface ILinks {
  href: (businessId: string) => string;
  label: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
}

export default function Header() {
  const pathname = usePathname();

  const { businessId } = useParams<{
    businessId?: string;
  }>();

  const { business } = useCurrentBusiness();

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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 relative">
          {/* Logo + negocio actual */}
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

            <Link
              href="/"
              className={isBusinessContext ? "hidden sm:block" : "block"}
            >
              <Image
                src={logo}
                alt="Hunay"
                width={110}
                height={34}
                className="h-8 w-auto"
                priority
              />
            </Link>

            {/* Nombre negocio desktop */}
            {isBusinessContext && business && (
              <div className="hidden sm:flex flex-col border-l border-gray-200 pl-3">
                <span className="max-w-[180px] truncate text-sm font-bold text-gray-900">
                  {business.name}
                </span>

                <span className="text-xs text-gray-500">Panel del negocio</span>
              </div>
            )}
          </div>

          {/* Nombre negocio móvil */}
          {/* Logo + nombre móvil */}
          {isBusinessContext && business && (
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center sm:hidden">
              <Link href="/">
                <Image
                  src={logo}
                  alt="Hunay"
                  width={80}
                  height={24}
                  className="h-5 w-auto"
                  priority
                />
              </Link>

              <span className="mt-1 max-w-[160px] truncate text-xs font-semibold text-gray-800">
                {business.name}
              </span>
            </div>
          )}

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
                      className={`
                        flex items-center gap-3 rounded-xl px-4 py-3 transition
                        ${
                          active
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
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
