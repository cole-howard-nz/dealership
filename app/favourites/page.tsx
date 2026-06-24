"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { vehicles } from "../data/vehicles";
import { VehicleCard } from "../components/VehicleCard";
import { useShortlist } from "../hooks/useShortlist";

export default function FavouritesPage() {
  const { favourites, clearFavourites } = useShortlist();
  const saved = vehicles.filter((v) => favourites.includes(v.id));

  if (saved.length === 0) {
    return (
      <div className="container-wide px-4 py-20 text-center">
        <Heart className="h-10 w-10 mx-auto text-ink-muted mb-3" aria-hidden="true" />
        <h1 className="font-heading text-2xl font-semibold">No favourites yet</h1>
        <p className="text-ink-muted mt-2">Tap the heart icon on any vehicle to save it here for this session.</p>
        <Link href="/inventory" className="inline-block mt-6 bg-accent text-white rounded-md px-6 py-3 font-semibold">Browse Inventory</Link>
      </div>
    );
  }

  return (
    <div className="container-wide px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-semibold">Your favourites</h1>
        <button onClick={clearFavourites} className="text-sm font-semibold text-ink-muted hover:text-error">Clear shortlist</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {saved.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
      </div>
    </div>
  );
}
