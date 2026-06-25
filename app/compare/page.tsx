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
    ["Price", (v) => <span className="font-bold text-base">{formatPrice(v.price)}</span>],
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
    <div className="compare-page">
      <div className="container-wide px-4 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="compare-eyebrow">Side by side</p>
            <h1 className="font-heading text-2xl font-bold">Compare vehicles</h1>
          </div>
          <Link href="/inventory" className="compare-back-link">
            ← Back to inventory
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">

            {/* Vehicle header cards */}
            <thead>
              <tr>
                <th className="compare-spec-col" />
                {selected.map((v) => (
                  <th key={v.id} className="compare-vehicle-col align-top pb-6 px-2">
                    <div className="compare-vehicle-card">
                      <div className="compare-img-wrap">
                        <img
                          src={v.images[0]?.url}
                          alt={v.images[0]?.alt ?? ""}
                          className="compare-img"
                        />
                      </div>
                      <div className="compare-vehicle-meta">
                        <p className="compare-vehicle-name">
                          {v.year} {v.make} {v.model}
                        </p>
                        {v.variant && (
                          <p className="compare-vehicle-variant">{v.variant}</p>
                        )}
                        <div className="compare-vehicle-actions">
                          <Link href={`/inventory/${v.slug}`} className="compare-link-view">
                            View details
                          </Link>
                          <button
                            onClick={() => removeFromCompare(v.id)}
                            className="compare-link-remove"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Spec rows */}
            <tbody>
              {rows.map(([label, get], i) => (
                <tr key={label} className={`compare-row ${i % 2 === 0 ? "compare-row-alt" : ""}`}>
                  <td className="compare-label">{label}</td>
                  {selected.map((v) => (
                    <td key={v.id} className="compare-value">{get(v)}</td>
                  ))}
                </tr>
              ))}

              {/* CTA row */}
              <tr className="compare-cta-row">
                <td className="compare-spec-col" />
                {selected.map((v) => (
                  <td key={v.id} className="compare-vehicle-col pt-4 pb-2">
                    <Link
                      href={`/inventory/${v.slug}`}
                      className="compare-cta-btn"
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

      <style>{`
        .compare-page { background: var(--color-bg); min-height: 100vh; }

        .compare-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #E15A2C;
          margin-bottom: 0.25rem;
        }
        .compare-back-link {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-ink-muted);
          text-decoration: none;
          transition: color 0.15s;
        }
        .compare-back-link:hover { color: #E15A2C; }

        /* Column widths */
        .compare-spec-col {
          width: 10rem;
          min-width: 8rem;
        }
        .compare-vehicle-col {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }

        /* Vehicle card in header */
        .compare-vehicle-card {
          background: var(--color-surface);
          border: 1.5px solid var(--color-border);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .compare-img-wrap {
          width: 100%;
          height: 160px;         
          overflow: hidden;
          background: var(--color-border);
          flex-shrink: 0;
        }
        .compare-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .compare-vehicle-meta {
          padding: 0.875rem 1rem 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .compare-vehicle-name {
          font-family: var(--font-sora), sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-ink);
          margin: 0 0 0.2rem;
        }
        .compare-vehicle-variant {
          font-size: 0.78rem;
          color: var(--color-ink-muted);
          margin: 0 0 0.6rem;
        }
        .compare-vehicle-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-top: auto;      
        }
        .compare-link-view {
          font-size: 0.78rem;
          font-weight: 700;
          color: #E15A2C;
          text-decoration: none;
        }
        .compare-link-view:hover { text-decoration: underline; }
        .compare-link-remove {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-ink-muted);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
        }
        .compare-link-remove:hover { color: #dc2626; }

        /* Spec rows */
        .compare-row {
          border-top: 1px solid var(--color-border);
        }
        .compare-row-alt {
          background: var(--color-surface);
        }
        .compare-label {
          padding: 0.875rem 0.75rem 0.875rem 0;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-ink-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
          vertical-align: middle;
        }
        .compare-value {
          padding: 0.875rem 0.75rem;
          font-size: 0.9rem;
          color: var(--color-ink);
          vertical-align: middle;
        }

        /* CTA */
        .compare-cta-row { border-top: 1.5px solid var(--color-border); }
        .compare-cta-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #E15A2C;
          color: #fff;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
          width: 100%;
        }
        .compare-cta-btn:hover { background: #C44A21; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}