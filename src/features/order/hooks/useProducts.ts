// useProducts.ts
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/features/common/database";

export function useProducts() {
  const products = useLiveQuery(() => db.products.toArray(), []);

  return {
    products: products ?? [],
    isLoading: products === undefined,
  };
}