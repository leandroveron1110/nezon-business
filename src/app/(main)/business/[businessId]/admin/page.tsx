// app/business/[businessId]/admin/page.tsx

import { redirect } from "next/navigation";

export default function AdministrationPage() {
  redirect("./admin/summary");
}