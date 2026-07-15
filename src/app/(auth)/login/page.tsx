// src/app/(auth)/login/page.tsx
'use client'; // Necesario para usar hooks de React

import React, { useEffect } from 'react';
import { LoginForm } from '../../../features/auth/components/LoginForm'; // Importa el componente del formulario
import { useRouter } from 'next/navigation'; // Para la redirección
import { useAuthStore } from '@/features/auth/store/authStore';
import Link from 'next/link';

/**
 * Página de inicio de sesión.
 * Si el usuario ya está autenticado, lo redirige a la página principal.
 */
export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth   } = useAuthStore(); // Obtiene el estado de autenticación

  useEffect(() => {
    // Al montar la página, verifica el estado de autenticación.
    // Esto es importante para manejar el caso de que el usuario ya esté logueado.
    checkAuth();
  }, [checkAuth]); // Se ejecuta solo una vez al montar

  useEffect(() => {
    // Si ya está autenticado y no está cargando la verificación inicial, redirige.
    if (!isLoading && isAuthenticated) {
      const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/';
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, router]); // Se ejecuta cuando cambian isAuthenticated o isLoading

  // Muestra un loader mientras se verifica la sesión inicial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Verificando sesión...</p>
      </div>
    );
  }

  // Si no está autenticado, muestra el formulario de login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Iniciar Sesión en Hunay
        </h1>
        <LoginForm />
        <p className="mt-6 text-center text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
