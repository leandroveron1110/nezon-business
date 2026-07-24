"use client"
import HistoryCashRegisterPage from "@/features/cashRegister/pages/HistoryCashRegisterPage";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();

  const businessId = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;

  if (!businessId) return null;
  return <HistoryCashRegisterPage businessId={businessId} />;
}
