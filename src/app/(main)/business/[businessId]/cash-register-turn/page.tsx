// app/business/[businessId]/cash-register/page.tsx

import { redirect } from "next/navigation";

export default function CashRegisterTurnPage() {
  redirect("./cash-register-turn/current");
}