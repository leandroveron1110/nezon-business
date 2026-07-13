"use client";

import { SearchResultBusiness } from "../types/search";
import { SearchBusinessCard } from "./components/card/SearchBusinessCard";

interface Props {
  businesses: SearchResultBusiness[];
}

export default function SearchBusinessList({ businesses }: Props) {
  if (!businesses || businesses.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map((business) => (
        <SearchBusinessCard key={business.id} business={business} />
      ))}
    </div>
  );
}