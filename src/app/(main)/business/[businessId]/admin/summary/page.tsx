// app/business/[businessId]/admin/summary/page.tsx

"use client";

import { AdministrationSummaryDashboard } from "@/features/admin/components/summary/AdministrationSummaryDashboard";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();

  const businessId = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;

  if (!businessId) return null;

  return <AdministrationSummaryDashboard businessId={businessId} />;
}