"use client";

import dynamic from "next/dynamic";

// En vez de la importación estática:
// import BusinessOrdersPage from "./BusinessOrdersPage";

// Hacemos la carga dinámica e indicamos que NO se ejecute en el servidor (SSR: false)
const BusinessOrdersPage = dynamic(() => import("./BusinessOrdersPage"), {
  ssr: false,
});

interface Props {
  businessId: string;
}

export default function Catalog({ businessId }: Props) {
  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-8">
        <BusinessOrdersPage businessId={businessId} />
      </div>
    </div>
  );
}