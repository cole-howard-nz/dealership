'use client'

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpDown, SearchX, X } from "lucide-react";
import { vehicles } from "../data/vehicles";
import { VehicleCard } from "../components/VehicleCard";
import { FilterBar, emptyFilters, InventoryFilters, CustomSelect, vehicleMatchesSearch } from "../components/FilterBar";

const PAGE_SIZE = 9;

function InventoryContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<InventoryFilters>({
    ...emptyFilters,
    bodyType: (searchParams.get("bodyType") as InventoryFilters["bodyType"]) || "",
  });
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "year-desc" | "odometer-asc">("year-desc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let result = vehicles.filter((v) => {
      if (!vehicleMatchesSearch(v, filters.search)) return false;
      if (filters.bodyType && v.bodyType !== filters.bodyType) return false;
      if (filters.make && v.make !== filters.make) return false;
      if (filters.minPrice && v.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && v.price > Number(filters.maxPrice)) return false;
      if (filters.minYear && v.year < Number(filters.minYear)) return false;
      if (filters.maxYear && v.year > Number(filters.maxYear)) return false;
      if (filters.transmission && v.transmission !== filters.transmission) return false;
      if (filters.fuelType && v.fuelType !== filters.fuelType) return false;
      return true;
    });

    switch (sort) {
      case "price-asc": result = [...result].sort((a, b) => a.price - b.price); break;
      case "price-desc": result = [...result].sort((a, b) => b.price - a.price); break;
      case "year-desc": result = [...result].sort((a, b) => b.year - a.year); break;
      case "odometer-asc": result = [...result].sort((a, b) => a.odometerKm - b.odometerKm); break;
    }
    return result;
  }, [filters, sort]);

  const visible = filtered.slice(0, visibleCount);

  const activeChips: { key: keyof InventoryFilters; label: string }[] = [];
  if (filters.search) activeChips.push({ key: "search", label: `"${filters.search}"` });
  if (filters.bodyType) activeChips.push({ key: "bodyType", label: filters.bodyType });
  if (filters.make) activeChips.push({ key: "make", label: filters.make });
  if (filters.transmission) activeChips.push({ key: "transmission", label: filters.transmission });
  if (filters.fuelType) activeChips.push({ key: "fuelType", label: filters.fuelType });
  if (filters.minPrice || filters.maxPrice) activeChips.push({ key: "minPrice", label: `$${filters.minPrice || "0"}–$${filters.maxPrice || "any"}` });
  if (filters.minYear || filters.maxYear) activeChips.push({ key: "minYear", label: `${filters.minYear || "any"}–${filters.maxYear || "any"}` });

  function removeChip(key: keyof InventoryFilters) {
    if (key === "minPrice") setFilters((f) => ({ ...f, minPrice: "", maxPrice: "" }));
    else if (key === "minYear") setFilters((f) => ({ ...f, minYear: "", maxYear: "" }));
    else setFilters((f) => ({ ...f, [key]: "" }));
  }

  function handleFiltersChange(f: InventoryFilters) {
    setFilters(f);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="container-wide px-4 py-8">
      <h1 className="font-heading text-2xl font-semibold mb-6">Inventory</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:hidden mb-2">
          <FilterBar filters={filters} onChange={handleFiltersChange} />
        </div>
        <div className="hidden lg:block">
          <FilterBar filters={filters} onChange={handleFiltersChange} />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm text-ink-muted">
                Showing {visible.length} of {filtered.length} vehicles
              </p>
              {activeChips.map((chip) => (
                <button key={chip.key} onClick={() => removeChip(chip.key)}
                  className="inline-flex items-center gap-1 bg-navy text-white rounded-lg px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80">
                  {chip.label} <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-ink-muted shrink-0" aria-hidden="true" />
              <div style={{ width: "200px" }}>
                <CustomSelect
                  value={sort}
                  onChange={(val: string) => setSort(val as typeof sort)}
                  options={[
                    { value: "year-desc", label: "Newest first" },
                    { value: "price-asc", label: "Price: Low to High" },
                    { value: "price-desc", label: "Price: High to Low" },
                    { value: "odometer-asc", label: "Odometer: Low to High" },
                  ]}
                  placeholder="Sort by"
                />
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 border border-border rounded-md bg-surface">
              <SearchX className="h-10 w-10 mx-auto text-ink-muted mb-3" aria-hidden="true" />
              <p className="font-semibold">No vehicles match those filters</p>
              <p className="text-sm text-ink-muted mt-1">
                {filters.search
                  ? `No results for "${filters.search}" — try a different search term.`
                  : "Try widening your price or year range."}
              </p>
              <button onClick={() => handleFiltersChange(emptyFilters)}
                className="mt-4 inline-flex items-center justify-center h-10 px-5 rounded-xl border-2 border-navy text-navy text-sm font-semibold transition-colors hover:bg-navy hover:text-white">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visible.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
              </div>
              {visibleCount < filtered.length && (
                <div className="text-center mt-8">
                  <button onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="inline-flex items-center justify-center h-12 px-6 rounded-xl border-2 border-navy text-navy font-semibold text-base transition-colors hover:bg-navy hover:text-white">
                    Load more vehicles
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="container-wide px-4 py-12 text-ink-muted">Loading inventory…</div>}>
      <InventoryContent />
    </Suspense>
  );
}