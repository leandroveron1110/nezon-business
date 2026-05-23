// useProducts.ts
"use client";
import { db } from "@/mini-back/infrastructure/dexie/db";
import { useLiveQuery } from "dexie-react-hooks";

export function useProducts() {
  const products = useLiveQuery(() => db.products.toArray(), []);

  return {
    products: products ?? [],
    isLoading: products === undefined,
  };
}