import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // No cachear en desarrollo
  register: true,   // Deja que la librería registre el SW automáticamente
  skipWaiting: true, // ⚡ CRÍTICO: Fuerza al nuevo Service Worker a activarse de inmediato
  clientsClaim: true, // ⚡ CRÍTICO: Toma el control de las pestañas abiertas inmediatamente
  
  // Forzar que el Service Worker se valide constantemente contra el servidor
  reloadOnOnline: true, 
});

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        port: "", // Agregamos esto para estandarizar el objeto
        pathname: "/**",
      },
    ],
  },
};

export default withPWA(nextConfig);