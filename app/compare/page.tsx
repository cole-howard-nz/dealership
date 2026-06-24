"use client";

import Link from "next/link";
import { GitCompare } from "lucide-react";
import { vehicles } from "../data/vehicles";
import { useShortlist } from "../hooks/useShortlist";
import { formatPrice, formatOdometer } from "../lib/format";
import type { Vehicle } from "../types/index";

export default function ComparePage() {
  const { compareIds, removeFromCompare } = useShortlist();
  const selected = vehicles.filter((v) => compareIds.includes(v.id));

  if (selected.length === 0) {
    return (
      <div className="container-wide px-4 py-20 text-center">
        <GitCompare className="h-10 w-10 mx-auto text-ink-muted mb-3" aria-hidden="true" />
        <h1 className="font-heading text-2xl font-semibold">Nothing to compare yet</h1>
        <p className="text-ink-muted mt-2">
          Add up to 3 vehicles to compare from any vehicle card or detail page.
        </p>
        <Link
          href="/inventory"
          className="inline-block mt-6 bg-accent text-white rounded-md px-6 py-3 font-semibold hover:bg-accent-hover transition-colors"
        >
          Browse Inventory
        </Link>
      </div>
    );
  }

  const rows: [string, (v: Vehicle) => React.ReactNode][] = [
    ["Price", (v) => formatPrice(v.price)],
    ["Year", (v) => v.year],
    ["Odometer", (v) => formatOdometer(v.odometerKm)],
    ["Fuel", (v) => v.fuelType],
    ["Transmission", (v) => v.transmission],
    ["Body type", (v) => v.bodyType],
    ["Drive type", (v) => v.driveType],
    ["Colour", (v) => v.colour],
    ["Import status", (v) => v.importStatus],
    ["Condition", (v) => v.condition],
    ["Key features", (v) => v.features.slice(0, 3).join(", ")],
  ];

  return (
    <div className="container-wide px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold">
          Compare vehicles ({selected.length}/3)
        </h1>
        <Link href="/inventory" className="text-sm font-semibold text-accent hover:underline">
          ← Back to inventory
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left p-3 w-36 text-sm text-ink-muted font-semibold">Spec</th>
              {selected.map((v) => (
                <th key={v.id} className="p-3 text-left align-top">
                  <img
                    src={v.images[0]?.url}
                    alt={v.images[0]?.alt ?? ""}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                  <p className="font-heading font-semibold">
                    {v.year} {v.make} {v.model}
                  </p>
                  {v.variant && <p className="text-xs text-ink-muted">{v.variant}</p>}
                  <div className="flex gap-3 mt-2">
                    <Link
                      href={`/inventory/${v.slug}`}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      View details
                    </Link>
                    <button
                      onClick={() => removeFromCompare(v.id)}
                      className="text-xs font-semibold text-ink-muted hover:text-error"
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, get]) => (
              <tr key={label} className="border-t border-border">
                <td className="p-3 text-sm font-semibold text-ink-muted">{label}</td>
                {selected.map((v) => (
                  <td key={v.id} className="p-3 text-sm">
                    {get(v)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-border bg-bg">
              <td className="p-3" />
              {selected.map((v) => (
                <td key={v.id} className="p-3">
                  <Link
                    href={`/inventory/${v.slug}`}
                    className="inline-flex items-center justify-center bg-accent text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-accent-hover transition-colors w-full"
                  >
                    Enquire Now
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
