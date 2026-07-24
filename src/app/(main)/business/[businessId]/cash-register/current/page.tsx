// app/business/[businessId]/cash-register/current/page.tsx

"use client";

import CurrentCashRegisterPage from "@/features/cashRegister/pages/CurrentCashRegisterPage";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();

  const businessId = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;

  if (!businessId) return null;

  return <CurrentCashRegisterPage businessId={businessId} />;
}