// src/app/providers.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient"; // o donde tengas tu cliente
import { AlertProvider } from "@/features/common/ui/Alert/Alert";
import { useBusinessPushSubscription } from "@/lib/hooks/useBusinessPushSubscription";

function PushSubscriptionManager() {
  useBusinessPushSubscription();
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
      async function init() {
    const { startHealthMonitor } = await import(
      "@/mini-back/infrastructure/connectivity/health-monitor"
    );

    startHealthMonitor();
  }

  init();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <PushSubscriptionManager />
        {children}
      </AlertProvider>
    </QueryClientProvider>
  );
}
