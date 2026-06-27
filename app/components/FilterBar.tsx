import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, X, Search } from "lucide-react";
import type { BodyType, Transmission, FuelType } from "../types";
import { vehicles } from "../data/vehicles";

export interface InventoryFilters {
  search: string;
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
  search: "",
  bodyType: "",
  make: "",
  minPrice: "",
  maxPrice: "",
  minYear: "",
  maxYear: "",
  transmission: "",
  fuelType: "",
};

const bodyTypes: BodyType[] = ["Sedan", "Hatchback", "SUV", "Ute", "Van", "Performance"];
const transmissions: Transmission[] = ["Automatic", "Manual", "CVT"];
const fuelTypes: FuelType[] = ["Petrol", "Diesel", "Hybrid", "PHEV", "EV"];

/**
 * Returns true if the vehicle matches a free-text search string.
 * Searches across make, model, variant, transmission, fuelType, colour, location, bodyType.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function vehicleMatchesSearch(vehicle: Parameters<typeof vehicles[0]["make"]["toLowerCase"]> extends never ? any : (typeof vehicles)[0], query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const fields = [
    vehicle.make,
    vehicle.model,
    vehicle.variant ?? "",
    vehicle.transmission,
    vehicle.fuelType,
    vehicle.colour,
    vehicle.location,
    vehicle.bodyType,
    String(vehicle.year),
    vehicle.driveType ?? "",
  ];
  return fields.some((f) => String(f).toLowerCase().includes(q));
}

interface Props {
  filters: InventoryFilters;
  onChange: (f: InventoryFilters) => void;
}

// ─── Custom Select ────────────────────────────────────────────────────────────
interface SelectProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

export function CustomSelect({ id, value, onChange, options, placeholder }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="custom-select-wrap" id={id}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`custom-select-trigger${open ? " open" : ""}${value ? " active" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? "select-value" : "select-placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`select-chevron${open ? " rotated" : ""}`} size={15} aria-hidden="true" />
      </button>

      {open && (
        <ul className="custom-select-dropdown" role="listbox">
          <li
            role="option"
            aria-selected={value === ""}
            className={`select-option${value === "" ? " selected" : ""}`}
            onClick={() => { onChange(""); setOpen(false); }}
          >
            {placeholder}
          </li>
          {options.map((o) => (
            <li
              key={o.value}
              role="option"
              aria-selected={value === o.value}
              className={`select-option${value === o.value ? " selected" : ""}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.value === value && <span className="select-check" aria-hidden="true">✓</span>}
              {o.label}
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .custom-select-wrap {
          position: relative;
          width: 100%;
        }
        .custom-select-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          background: #fff;
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 9px 12px;
          font-size: 0.875rem;
          color: var(--color-ink);
          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          text-align: left;
        }
        .custom-select-trigger:hover {
          border-color: var(--color-navy);
        }
        .custom-select-trigger.open,
        .custom-select-trigger:focus-visible {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(220, 100, 30, 0.12);
          outline: none;
        }
        .custom-select-trigger.active {
          border-color: var(--color-navy);
          background: var(--color-navy);
          color: #fff;
        }
        .custom-select-trigger.active .select-chevron { color: rgba(255,255,255,0.7); }
        .select-placeholder { color: var(--color-ink-muted); }
        .select-value { font-weight: 500; }
        .select-chevron {
          flex-shrink: 0;
          color: var(--color-ink-muted);
          transition: transform 0.2s ease;
        }
        .select-chevron.rotated { transform: rotate(180deg); }

        .custom-select-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 50;
          background: #fff;
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          padding: 4px;
          margin: 0;
          list-style: none;
          overflow: hidden;
        }
        .select-option {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px 9px 32px;
          font-size: 0.875rem;
          color: var(--color-ink);
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.1s ease;
        }
        .select-option:first-child {
          color: var(--color-ink-muted);
          padding-left: 12px;
        }
        .select-option:hover {
          background: var(--color-bg);
        }
        .select-option.selected {
          background: var(--color-navy);
          color: #fff;
          font-weight: 600;
        }
        .select-option.selected:first-child {
          color: rgba(255,255,255,0.75);
        }
        .select-check {
          position: absolute;
          left: 10px;
          font-size: 0.75rem;
          color: var(--color-accent);
          font-weight: 700;
        }
        .select-option.selected .select-check {
          color: #fff;
        }
      `}</style>
    </div>
  );
}

// ─── SearchBar ────────────────────────────────────────────────────────────────
interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="search-bar-wrap">
      <Search className="search-icon" size={15} aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        aria-label="Search vehicles"
        placeholder="Search make, model, fuel…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => { onChange(""); inputRef.current?.focus(); }}
          className="search-clear"
        >
          <X size={13} />
        </button>
      )}
      <style>{`
        .search-bar-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          color: var(--color-ink-muted);
          pointer-events: none;
          flex-shrink: 0;
        }
        .search-input {
          width: 100%;
          background: #fff;
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 9px 32px 9px 32px;
          font-size: 0.875rem;
          color: var(--color-ink);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          /* remove browser default search cancel button */
          -webkit-appearance: none;
          appearance: none;
        }
        .search-input::-webkit-search-cancel-button { display: none; }
        .search-input::placeholder { color: var(--color-ink-muted); }
        .search-input:hover { border-color: var(--color-navy); }
        .search-input:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(220, 100, 30, 0.12);
          outline: none;
        }
        .search-clear {
          position: absolute;
          right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--color-border);
          color: var(--color-ink-muted);
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
          border: none;
          padding: 0;
        }
        .search-clear:hover {
          background: var(--color-ink-muted);
          color: #fff;
        }
      `}</style>
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────
export function FilterBar({ filters, onChange }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const makes = Array.from(new Set(vehicles.map((v) => v.make))).sort();

  const priceError = filters.minPrice && filters.maxPrice && Number(filters.minPrice) > Number(filters.maxPrice)
    ? "Min price must be lower than max." : "";
  const yearError = filters.minYear && filters.maxYear && Number(filters.minYear) > Number(filters.maxYear)
    ? "Min year must be earlier than max." : "";

  const set = (patch: Partial<InventoryFilters>) => onChange({ ...filters, ...patch });

  const inputClass = "w-full rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border)] bg-white px-3 py-[9px] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(220,100,30,0.12)] transition-colors";

  const content = (
    <div className="flex flex-col gap-5">
      {/* ── Search ── */}
      <div>
        <label className="filter-label" htmlFor="f-search">Search</label>
        <SearchBar
          value={filters.search}
          onChange={(val) => set({ search: val })}
        />
      </div>

      <div className="filter-divider" />

      <div>
        <label className="filter-label" htmlFor="f-bodytype">Body type</label>
        <CustomSelect
          id="f-bodytype"
          value={filters.bodyType}
          onChange={(val) => set({ bodyType: val as BodyType | "" })}
          options={bodyTypes.map((b) => ({ value: b, label: b }))}
          placeholder="All types"
        />
      </div>

      <div>
        <label className="filter-label" htmlFor="f-make">Make</label>
        <CustomSelect
          id="f-make"
          value={filters.make}
          onChange={(val) => set({ make: val })}
          options={makes.map((m) => ({ value: m, label: m }))}
          placeholder="All makes"
        />
      </div>

      <div>
        <span className="filter-label">Price range (NZD)</span>
        <div className="flex gap-2">
          <input type="number" min={0} aria-label="Minimum price" placeholder="Min"
            value={filters.minPrice} onChange={(e) => set({ minPrice: e.target.value })}
            className={inputClass} />
          <input type="number" min={0} aria-label="Maximum price" placeholder="Max"
            value={filters.maxPrice} onChange={(e) => set({ maxPrice: e.target.value })}
            className={inputClass} />
        </div>
        {priceError && <p className="text-xs text-red-500 mt-1" role="alert">{priceError}</p>}
      </div>

      <div>
        <span className="filter-label">Year range</span>
        <div className="flex gap-2">
          <input type="number" aria-label="Minimum year" placeholder="From"
            value={filters.minYear} onChange={(e) => set({ minYear: e.target.value })}
            className={inputClass} />
          <input type="number" aria-label="Maximum year" placeholder="To"
            value={filters.maxYear} onChange={(e) => set({ maxYear: e.target.value })}
            className={inputClass} />
        </div>
        {yearError && <p className="text-xs text-red-500 mt-1" role="alert">{yearError}</p>}
      </div>

      <div>
        <label className="filter-label" htmlFor="f-trans">Transmission</label>
        <CustomSelect
          id="f-trans"
          value={filters.transmission}
          onChange={(val) => set({ transmission: val as Transmission | "" })}
          options={transmissions.map((t) => ({ value: t, label: t }))}
          placeholder="Any"
        />
      </div>

      <div>
        <label className="filter-label" htmlFor="f-fuel">Fuel type</label>
        <CustomSelect
          id="f-fuel"
          value={filters.fuelType}
          onChange={(val) => set({ fuelType: val as FuelType | "" })}
          options={fuelTypes.map((f) => ({ value: f, label: f }))}
          placeholder="Any"
        />
      </div>

      <button
        onClick={() => onChange(emptyFilters)}
        className="text-sm font-semibold text-left transition-opacity hover:opacity-70"
        style={{ color: "var(--color-accent)" }}
      >
        Clear all filters
      </button>

      <style>{`
        .filter-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-ink-muted);
          margin-bottom: 6px;
        }
        .filter-divider {
          height: 1px;
          background: var(--color-border);
          margin: -4px 0;
        }
      `}</style>
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

      <aside
        className="hidden lg:block w-64 shrink-0 sticky top-24 self-start rounded-[var(--radius-md)] p-5"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        aria-label="Vehicle filters"
      >
        <div className="flex items-center gap-2 mb-5" style={{ color: "var(--color-ink)" }}>
          <SlidersHorizontal className="h-4 w-4" style={{ color: "var(--color-accent)" }} aria-hidden="true" />
          <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Refine results</span>
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
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-6 w-full text-white rounded-[var(--radius-md)] py-3 font-semibold text-sm"
              style={{ background: "var(--color-accent)" }}
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  );
}