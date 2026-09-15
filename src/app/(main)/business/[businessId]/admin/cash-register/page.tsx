// app/business/[businessId]/admin/cash-register/page.tsx

"use client";
import CashRegisterPage from "@/features/admin/components/cashRegister/CashRegister";
import TreasuryPage from "@/features/admin/components/treasury/TreasuryPage";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();

  const businessId = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;

  if (!businessId) return null;

  return <CashRegisterPage businessId={businessId} />;
}
