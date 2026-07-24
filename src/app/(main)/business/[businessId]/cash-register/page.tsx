// app/business/[businessId]/cash-register/page.tsx

import { redirect } from "next/navigation";

export default function CashRegisterPage() {
  redirect("./cash-register/current");
}