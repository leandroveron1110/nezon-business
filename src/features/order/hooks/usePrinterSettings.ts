import { useState } from "react";

// src/features/business/hooks/usePrinterSettings.ts
export const usePrinterSettings = () => {
  const [autoPrint, setAutoPrint] = useState<boolean>(() => {
    return localStorage.getItem("locus_auto_print") === "true";
  });

  const toggleAutoPrint = (val: boolean) => {
    setAutoPrint(val);
    localStorage.setItem("locus_auto_print", String(val));
  };

  return { autoPrint, toggleAutoPrint };
};