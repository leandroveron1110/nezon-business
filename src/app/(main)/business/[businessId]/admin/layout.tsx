// app/business/[businessId]/admin/layout.tsx

import AdminNavigation from "@/features/admin/components/AdminNavigation";
import Header from "@/features/header/components/Header";

export default function AdministrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-gray-50">
      <Header />

      <AdminNavigation />

      {children}
    </div>
  );
}
