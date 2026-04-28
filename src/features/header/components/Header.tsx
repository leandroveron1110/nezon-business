"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { 
  ShoppingBag, 
  Store,  
  Menu as MenuIconLucide, 
  X, 
  LucideProps,
  Package,
  Users,  
  Settings 
} from "lucide-react"; 
import React, { useState } from "react";
import Image from "next/image"; 
import img from "../../../app/Nezon.svg" 

interface ILinks {
  // La URL es una función que toma el businessId y devuelve la ruta
  href: (businessId: string) => string; 
  label: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}

export default function Header() {
  const pathname = usePathname();
  // Obtiene el businessId del segmento dinámico [businessId] de la URL
  const params = useParams<{ businessId?: string }>(); 
  const businessId = params.businessId; 

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 🔗 DEFINICIÓN DE LOS ENLACES USANDO EL businessId
  const links: ILinks[] = [
    // 1. Negocios (Vuelve al listado o raíz)
    { href: () => `/`, label: "Negocios", icon: Store }, 
    // 2. Órdenes
    { href: (id) => `/business/${id}/orders`, label: "Órdenes", icon: ShoppingBag },
    // 3. Productos
    { href: (id) => `/business/${id}/products`, label: "Productos", icon: Package },
    // 4. Personal
    { href: (id) => `/business/${id}/employees`, label: "Personal", icon: Users },
    // 5. Ajustes del Perfil del Negocio
    { href: (id) => `/business/${id}/profile`, label: "Ajustes", icon: Settings },
  ];
  
  // Condición para mostrar los enlaces: Solo si existe un businessId
  const isBusinessContext = !!businessId;

  // 🎯 Función auxiliar para determinar si un link está activo
  const checkIsActive = (linkHref: string) => {
    // Si el link es la raíz, solo es activo si el pathname es exactamente '/'
    if (linkHref === '/') {
      return pathname === '/';
    }
    // Para las rutas de negocio, verifica si el pathname comienza con el linkHref
    return pathname.startsWith(linkHref);
  }

  return (
    <header className="bg-white shadow sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between relative">
        
        {/* Lado izquierdo: Logo y botón de menú móvil */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Menú hamburguesa móvil: Solo si estamos en contexto de negocio */}
          {isBusinessContext && (
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú móvil"
            >
              {mobileMenuOpen ? <X size={28} /> : <MenuIconLucide size={28} />}
            </button>
          )}

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image 
              src={img} 
              alt="Nezon Logo" 
              width={100} 
              height={32} 
              // Se recomienda agregar el 'priority' si es un logo clave para el LCP
              // priority 
              className="h-8 w-auto" 
            />
          </Link>
        </div>

        {/* Menú de navegación escritorio (SOLO si estamos en contexto de negocio) */}
        {isBusinessContext && businessId && (
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex gap-10">
              {links.map((link) => {
                const linkHref = link.href(businessId);
                const isActive = checkIsActive(linkHref);
                
                return (
                  <li key={linkHref}>
                    <Link
                      href={linkHref}
                      className={`flex flex-col items-center justify-center gap-1
                        text-sm font-medium transition-colors duration-200 group
                        ${
                          isActive
                            ? "text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      <link.icon
                        size={24}
                        strokeWidth={isActive ? 2 : 1.5}
                        className="transition-transform duration-200 group-hover:scale-110"
                      />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

      </div>

      {mobileMenuOpen && (
        <div 
          className="
            md:hidden 
            absolute top-full left-0 right-0 
            bg-white 
            shadow-lg 
            border-t border-gray-200 
            z-40 
            max-h-[80vh] overflow-y-auto 
          "
        >
          <ul className="flex flex-col gap-4 p-4">
            {/* Solo mostramos los enlaces de negocio si estamos en contexto de negocio */}
            {isBusinessContext && businessId && links.map((link) => {
                const linkHref = link.href(businessId);
                const isActive = checkIsActive(linkHref);
                
                return (
                  <li key={linkHref}>
                    <Link
                      href={linkHref}
                      className={`flex items-center gap-3 text-base font-medium
                        ${
                          isActive
                            ? "text-blue-600"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <link.icon size={20} />
                      {link.label}
                    </Link>
                  </li>
                );
            })}
             
          </ul>
        </div>
      )}
    </header>
  );
}