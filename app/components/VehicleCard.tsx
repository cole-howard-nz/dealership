"use client";

import Link from 'next/link'
import Image from 'next/image'
import { Gauge, Fuel, Calendar, Heart, GitCompare } from "lucide-react";
import type { Vehicle } from "../types";
import { Badge } from "./Badge";
import { formatPrice, formatOdometer } from "../lib/format";
import { useToast } from "../hooks/useToast";
import { useShortlist } from "../hooks/useShortlist";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { isFavourited, toggleFavourite, isInCompare, toggleCompare, compareFull } = useShortlist();
  const { showToast } = useToast();
  const favourited = isFavourited(vehicle.id);
  const inCompare = isInCompare(vehicle.id);
  const isSold = vehicle.status === "Sold";
  const isIncoming = vehicle.status === "Incoming";
  const cover = vehicle.images[0];

  const handleFavourite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavourite(vehicle.id);
    showToast(favourited ? "Removed from favourites" : "Saved to favourites");
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    const result = toggleCompare(vehicle.id);
    if (!result.ok) {
      showToast(result.reason ?? "Could not add to compare");
    } else {
      showToast(inCompare ? "Removed from compare" : "Added to compare");
    }
  };

  return (
    <div className="group relative bg-surface rounded-xl border border-border overflow-hidden hover:-translate-y-0.5 transition-all duration-150" style={{ '--tw-shadow': 'var(--shadow-card-hover)' } as React.CSSProperties}>
      <Link
        href={isSold ? "#" : `/inventory/${vehicle.slug}`}
        onClick={(e) => isSold && e.preventDefault()}
        className={isSold ? "cursor-default" : ""}
        aria-label={`${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.variant ? " " + vehicle.variant : ""}`}
      >
        <div className="relative aspect-[3/2] bg-border">
          {cover && <Image width={1920} height={1080} src={cover.url} alt={cover.alt} className={`h-full w-full object-cover ${isSold ? "opacity-50" : ""}`} loading="lazy" />}
          <div className="absolute top-3 left-3 flex gap-2">
            {isSold && <Badge tone="navy">Sold</Badge>}
            {isIncoming && (
              <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide uppercase">
                Coming Soon
              </span>
            )}
            {vehicle.status === "Reserved" && <Badge tone="warning">Reserved</Badge>}
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={handleFavourite}
              aria-pressed={favourited}
              aria-label={favourited ? "Remove from favourites" : "Save to favourites"}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow"
            >
              <Heart className={`h-4 w-4 ${favourited ? "fill-accent text-accent" : "text-navy"}`} aria-hidden="true" />
            </button>
            <button
              onClick={handleCompare}
              aria-pressed={inCompare}
              disabled={!inCompare && compareFull}
              aria-label={inCompare ? "In compare" : "Add to compare"}
              title={!inCompare && compareFull ? "Remove one to add another." : undefined}
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow disabled:opacity-40"
            >
              <GitCompare className={`h-4 w-4 ${inCompare ? "text-accent" : "text-navy"}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-ink-muted font-medium uppercase tracking-wide">{vehicle.bodyType} · {vehicle.location}</p>
          <h3 className="font-heading text-lg font-semibold text-ink mt-1">
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant ?? ""}
          </h3>
          <p className="font-heading text-xl font-bold text-ink mt-1">
            {formatPrice(vehicle.price)} {vehicle.priceNote && <span className="text-xs font-normal text-ink-muted">{vehicle.priceNote}</span>}
          </p>
          <dl className="flex items-center gap-4 mt-3 text-sm text-ink-muted">
            <div className="flex items-center gap-1.5"><Gauge className="h-4 w-4" aria-hidden="true" /><dt className="sr-only">Odometer</dt><dd>{formatOdometer(vehicle.odometerKm)}</dd></div>
            <div className="flex items-center gap-1.5"><Fuel className="h-4 w-4" aria-hidden="true" /><dt className="sr-only">Fuel</dt><dd>{vehicle.fuelType}</dd></div>
            <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" aria-hidden="true" /><dt className="sr-only">Transmission</dt><dd>{vehicle.transmission}</dd></div>
          </dl>
        </div>
      </Link>
    </div>
  );
}
