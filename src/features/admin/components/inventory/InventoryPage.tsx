"use client";

import { useState } from "react";

import ProductList from "./products/ProductList";
import InventoryHeader from "./InventoryHeader";
import InventoryTabs from "./InventoryTabs";
import StockOverview from "./stock/StockOverview";
import LocationList from "./locations/LocationList";
import BaseUnitList from "./units/BaseUnitList";

type InventorySection =
  | "products"
  | "stock"
  | "locations"
  | "presentation"
  | "settings";

interface InventoryPageProps {
  businessId: string;
}

export default function InventoryPage({
  businessId,
}: InventoryPageProps) {
  const [section, setSection] = useState<InventorySection>("products");

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-950 text-slate-100">
      <InventoryHeader />

      <InventoryTabs
        section={section}
        onChange={setSection}
      />

      <main className="min-h-0 flex-1 overflow-auto p-6 bg-slate-900/30">
        {section === "products" && (
          <ProductList businessId={businessId} />
        )}

        {section === "stock" && (
          <StockOverview businessId={businessId} />
        )}

        {section === "locations" && (
          <LocationList businessId={businessId} />
        )}

        {section === "settings" && (
          <BaseUnitList />
        )}
      </main>
    </div>
  );
}