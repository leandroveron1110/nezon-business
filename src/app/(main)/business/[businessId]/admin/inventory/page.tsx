// app/business/[businessId]/admin/inventory/page

"use client";

import InventoryPage from "@/features/admin/components/inventory/InventoryPage";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();

  const businessId = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;

  if (!businessId) return null;

  return <InventoryPage businessId={businessId} />;
}
