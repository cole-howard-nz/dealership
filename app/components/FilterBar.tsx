import { useState } from "react";
import { SlidersHorizontal, Search, X } from "lucide-react";
import type { BodyType, Transmission, FuelType } from "../types";
import { vehicles } from "../data/vehicles";

export interface InventoryFilters {
  bodyType: BodyType | "";
  make: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  transmission: Transmission | "";
  fuelType: FuelType | "";
}

export const emptyFilters: InventoryFilters = {
  bodyType: "", make: "", minPrice: "", maxPrice: "", minYear: "", maxYear: "", transmission: "", fuelType: "",
};

const bodyTypes: BodyType[] = ["Sedan", "Hatchback", "SUV", "Ute", "Van", "Performance"];
const transmissions: Transmission[] = ["Automatic", "Manual", "CVT"];
const fuelTypes: FuelType[] = ["Petrol", "Diesel", "Hybrid", "PHEV", "EV"];

interface Props {
  filters: InventoryFilters;
  onChange: (f: InventoryFilters) => void;
}

export function FilterBar({ filters, onChange }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const makes = Array.from(new Set(vehicles.map((v) => v.make))).sort();

  const priceError = filters.minPrice && filters.maxPrice && Number(filters.minPrice) > Number(filters.maxPrice)
    ? "Minimum price must be lower than maximum price." : "";
  const yearError = filters.minYear && filters.maxYear && Number(filters.minYear) > Number(filters.maxYear)
    ? "Minimum year must be earlier than maximum year." : "";

  const set = (patch: Partial<InventoryFilters>) => onChange({ ...filters, ...patch });

  const content = (
    <div className="flex flex-col gap-5">
      <div>
        <label className="text-sm font-semibold block mb-1" htmlFor="f-bodytype">Body type</label>
        <select id="f-bodytype" className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          value={filters.bodyType} onChange={(e) => set({ bodyType: e.target.value as BodyType | "" })}>
          <option value="">All types</option>
          {bodyTypes.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold block mb-1" htmlFor="f-make">Make</label>
        <select id="f-make" className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          value={filters.make} onChange={(e) => set({ make: e.target.value })}>
          <option value="">All makes</option>
          {makes.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <span className="text-sm font-semibold block mb-1">Price range (NZD)</span>
        <div className="flex gap-2">
          <input type="number" min={0} aria-label="Minimum price" placeholder="Min" value={filters.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })} className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
          <input type="number" min={0} aria-label="Maximum price" placeholder="Max" value={filters.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })} className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
        </div>
        {priceError && <p className="text-xs text-error mt-1" role="alert">{priceError}</p>}
      </div>

      <div>
        <span className="text-sm font-semibold block mb-1">Year range</span>
        <div className="flex gap-2">
          <input type="number" aria-label="Minimum year" placeholder="From" value={filters.minYear}
            onChange={(e) => set({ minYear: e.target.value })} className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
          <input type="number" aria-label="Maximum year" placeholder="To" value={filters.maxYear}
            onChange={(e) => set({ maxYear: e.target.value })} className="w-full rounded-sm border border-border px-3 py-2 text-sm" />
        </div>
        {yearError && <p className="text-xs text-error mt-1" role="alert">{yearError}</p>}
      </div>

      <div>
        <label className="text-sm font-semibold block mb-1" htmlFor="f-trans">Transmission</label>
        <select id="f-trans" className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          value={filters.transmission} onChange={(e) => set({ transmission: e.target.value as Transmission | "" })}>
          <option value="">Any</option>
          {transmissions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm font-semibold block mb-1" htmlFor="f-fuel">Fuel type</label>
        <select id="f-fuel" className="w-full rounded-sm border border-border px-3 py-2 text-sm"
          value={filters.fuelType} onChange={(e) => set({ fuelType: e.target.value as FuelType | "" })}>
          <option value="">Any</option>
          {fuelTypes.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <button onClick={() => onChange(emptyFilters)} className="text-sm font-semibold text-accent text-left hover:underline">
        Clear all filters
      </button>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 text-sm font-semibold border border-border rounded-md px-4 py-2 bg-surface"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filters
      </button>

      <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start bg-surface border border-border rounded-md p-5" aria-label="Vehicle filters">
        <div className="flex items-center gap-2 mb-4 text-ink font-heading font-semibold">
          <Search className="h-4 w-4" aria-hidden="true" /> Refine results
        </div>
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex" role="dialog" aria-modal="true" aria-label="Vehicle filters">
          <div className="bg-surface w-full max-w-sm h-full overflow-y-auto p-5 ml-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading font-semibold text-lg">Filters</h2>
              <button onClick={() => setMobileOpen(false)} aria-label="Close filters"><X className="h-5 w-5" /></button>
            </div>
            {content}
            <button onClick={() => setMobileOpen(false)} className="mt-6 w-full bg-accent text-white rounded-md py-3 font-semibold">
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
