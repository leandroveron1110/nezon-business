"use client";
import { useMemo, useState } from "react";
import { searchLocation } from "@/lib/search-location";

export function useLocationAutocomplete() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    return searchLocation(query);
  }, [query]);

  return {
    query,
    setQuery,
    results
  };
}