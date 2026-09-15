"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useParams, usePathname } from "next/navigation";

import logo from "../../../app/Nezon.svg";

import { useCurrentBusiness } from "../hooks/useCurrentBusiness";

import { navigationTree } from "../navigation/navigation.config";
import { DesktopNavigation } from "../navigation/DesktopNavigation";
import { MobileNavigation } from "../navigation/MobileNavigation";

export default function Header() {
  const pathname = usePathname();

  const { businessId } = useParams<{
    businessId?: string;
  }>();

  const { business } = useCurrentBusiness();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isBusinessContext = Boolean(businessId);

  return (
    <>
      <header
        className="
          sticky top-0 z-40
          border-b border-gray-200
          bg-white/90 backdrop-blur
        "
      >
        <div
          className="
            relative mx-auto flex h-16
            max-w-7xl items-center
            justify-between px-4
          "
        >
          {/* LEFT */}

          <div className="flex items-center gap-3">
            {isBusinessContext && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen((value) => !value)}
                className="
                  rounded-xl p-2
                  transition hover:bg-gray-100
                  md:hidden
                "
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
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

            {isBusinessContext && business && (
              <div
                className="
                  hidden flex-col
                  border-l border-gray-200
                  pl-3 sm:flex
                "
              >
                <span
                  className="
                    max-w-[180px] truncate
                    text-sm font-bold text-gray-900
                  "
                >
                  {business.name}
                </span>

                <span className="text-xs text-gray-500">Panel del negocio</span>
              </div>
            )}
          </div>

          {/* MOBILE CENTER */}

          {isBusinessContext && business && (
            <div
              className="
                absolute left-1/2
                flex -translate-x-1/2
                flex-col items-center
                sm:hidden
              "
            >
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

              <span
                className="
                  mt-1 max-w-[160px]
                  truncate text-xs
                  font-semibold text-gray-800
                "
              >
                {business.name}
              </span>
            </div>
          )}

          {/* DESKTOP NAVIGATION */}

          {isBusinessContext && businessId && (
            <DesktopNavigation
              nodes={navigationTree}
              businessId={businessId}
              pathname={pathname}
            />
          )}
        </div>
      </header>

      {/* MOBILE NAVIGATION */}

      {mobileMenuOpen && isBusinessContext && businessId && (
        <MobileNavigation
          nodes={navigationTree}
          businessId={businessId}
          pathname={pathname}
          closeMenu={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
