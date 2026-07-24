// app/business/[businessId]/cash-register/layout.tsx

import CashRegisterNavigation from "@/features/cashRegister/components/CashRegisterNavigation";
import Header from "@/features/header/components/Header";

export default function CashRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-gray-50">
      <Header />

      <CashRegisterNavigation />

      {children}
    </div>
  );
}