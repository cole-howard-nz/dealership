"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Expand, X, Heart, GitCompare, Gauge, Fuel,
  Calendar, Settings2, ShieldCheck, Mail, Repeat, Phone,
  CheckCircle2,
} from "lucide-react";
import { formatPrice, formatOdometer } from "../../../lib/format";
import { Badge } from "../../../components/Badge";
import { VehicleCard } from "../../../components/VehicleCard";
import { EnquiryForm } from "../../../components/EnquiryForm";
import { FinanceCalculator } from "../../../components/FinanceCalculator";
import { useShortlist } from "../../../hooks/useShortlist";
import { useToast } from "../../../hooks/useToast";
import type { Vehicle, VehicleImage } from "../../../types";

interface Props {
  vehicle: Vehicle;
  similar: Vehicle[];
  locationId: string;
}

export function VehicleDetailClient({ vehicle, similar, locationId }: Props) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const { isFavourited, toggleFavourite, isInCompare, toggleCompare, compareFull } = useShortlist();
  const { showToast } = useToast();

  if (!vehicle) {
    router.replace("/inventory");
    return null;
  }

  const images: VehicleImage[] =
    vehicle.images.length > 0
      ? vehicle.images
      : [{ url: "https://picsum.photos/seed/placeholder/960/640", alt: "Photo coming soon", order: 0 }];
  const favourited = isFavourited(vehicle.id);
  const inCompare = isInCompare(vehicle.id);

  function handleCompareClick() {
    const result = toggleCompare(vehicle.id);
    showToast(
      result.ok
        ? inCompare
          ? "Removed from compare"
          : "Added to compare"
        : result.reason ?? ""
    );
  }

  return (
    <div className="container-wide px-4 py-8 pb-28 lg:pb-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-ink-muted mb-6 flex items-center gap-1" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link href="/inventory" className="hover:text-accent">Inventory</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span aria-current="page">{vehicle.make} {vehicle.model}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main column */}
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="relative rounded-xl overflow-hidden bg-border aspect-[3/2]">
            <Image
              src={images[activeImage].url}
              alt={images[activeImage].alt}
              className="h-full w-full object-cover"
              width={960}
              height={640}
              priority
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            )}
            <button
              onClick={() => setLightbox(true)}
              aria-label="View fullscreen"
              className="absolute bottom-3 right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow"
            >
              <Expand className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 left-3 bg-black/50 text-white text-xs rounded-full px-3 py-1">
              {activeImage + 1} / {images.length}
            </span>
          </div>
          {/* Thumbnails */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={img.url + i}
                onClick={() => setActiveImage(i)}
                aria-label={`View photo ${i + 1}: ${img.alt}`}
                className={`shrink-0 h-16 w-24 rounded overflow-hidden border-2 transition-colors ${
                  i === activeImage ? "border-accent" : "border-transparent"
                }`}
              >
                <Image src={img.url} alt="" width={96} height={64} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {/* Title + price */}
          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {vehicle.status === "Reserved" && <Badge tone="warning">Reserved</Badge>}
                {vehicle.status === "Incoming" && <Badge tone="warning">Coming Soon</Badge>}
                <Badge tone="navy">{vehicle.importStatus}</Badge>
              </div>
              <h1 className="font-heading text-3xl font-bold">
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}
              </h1>
              <p className="text-ink-muted mt-1">{vehicle.location} · VIN {vehicle.vin}</p>
            </div>
            <div className="text-right">
              {vehicle.previousPrice && (
                <p className="text-sm text-ink-muted line-through">{formatPrice(vehicle.previousPrice)}</p>
              )}
              <p className="text-3xl font-bold" style={vehicle.previousPrice ? { color: "#15803D" } : undefined}>
                {formatPrice(vehicle.price)}
              </p>
              {vehicle.priceNote && <p className="text-sm text-ink-muted">{vehicle.priceNote}</p>}
              <p className="text-sm text-success font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Delivered anywhere in NZ
              </p>
            </div>
          </div>

          {/* Key specs */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-ink-muted shrink-0" aria-hidden="true" />
              <div><dt className="text-xs text-ink-muted">Odometer</dt><dd className="font-semibold text-sm">{formatOdometer(vehicle.odometerKm)}</dd></div>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-ink-muted shrink-0" aria-hidden="true" />
              <div><dt className="text-xs text-ink-muted">Fuel</dt><dd className="font-semibold text-sm">{vehicle.fuelType}</dd></div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-ink-muted shrink-0" aria-hidden="true" />
              <div><dt className="text-xs text-ink-muted">Year</dt><dd className="font-semibold text-sm">{vehicle.year}</dd></div>
            </div>
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-ink-muted shrink-0" aria-hidden="true" />
              <div><dt className="text-xs text-ink-muted">Transmission</dt><dd className="font-semibold text-sm">{vehicle.transmission}</dd></div>
            </div>
          </dl>

          {/* Inspection badge */}
          <div className="mt-8 bg-success/5 border border-success/20 rounded-xl p-5 flex gap-4 items-start">
            <ShieldCheck className="h-6 w-6 text-success shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="font-heading font-semibold text-lg">Independently inspected</h2>
              <p className="text-sm text-ink-muted mt-1">
                This vehicle passed our {vehicle.condition.toLowerCase()}-condition standard before listing — mechanical,
                cosmetic, and odometer checks all verified.
              </p>
              {vehicle.inspectionReportUrl && (
                <a
                  href={vehicle.inspectionReportUrl}
                  className="text-sm font-semibold text-accent hover:underline mt-2 inline-block"
                >
                  View full inspection report →
                </a>
              )}
            </div>
          </div>

          {/* Full spec table */}
          <div className="mt-8">
            <h2 className="font-heading font-semibold text-xl mb-4">Full specification</h2>
            <dl className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface text-sm">
              {(
                [
                  ["Make", vehicle.make],
                  ["Model", vehicle.model],
                  ["Variant", vehicle.variant ?? "—"],
                  ["Body type", vehicle.bodyType],
                  ["Drivetrain", vehicle.driveType],
                  ["Engine size", vehicle.engineSizeCc ? `${vehicle.engineSizeCc}cc` : "—"],
                  ["Colour", vehicle.colour],
                  ["Doors", vehicle.doors ?? "—"],
                  ["Seats", vehicle.seats ?? "—"],
                  ["Condition", vehicle.condition],
                  ["Import status", vehicle.importStatus],
                ] as [string, string | number][]
              ).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-5 py-3">
                  <dt className="text-ink-muted w-1/3">{label}</dt>
                  <dd className="font-medium text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Finance estimate */}
          {vehicle.financeEligible && (
            <div className="mt-10">
              <h2 className="font-heading font-semibold text-xl mb-4">Finance estimate</h2>
              <FinanceCalculator defaultPrice={vehicle.price} vehicleId={vehicle.id} />
            </div>
          )}

          {/* Similar vehicles */}
          {similar.length > 0 && (
            <div className="mt-12">
              <h2 className="font-heading font-semibold text-xl mb-4">Similar vehicles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {similar.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA sidebar — desktop only */}
        <div className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden bg-surface border border-border rounded-xl p-6" style={{ scrollbarWidth: "none" }}>
            {/* Save / Compare */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => toggleFavourite(vehicle.id)}
                aria-pressed={favourited}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-navy rounded-lg py-2 text-sm font-semibold hover:bg-navy hover:text-white transition-colors"
              >
                <Heart className={`h-4 w-4 ${favourited ? "fill-current" : ""}`} aria-hidden="true" />
                {favourited ? "Saved" : "Save"}
              </button>
              <button
                onClick={handleCompareClick}
                disabled={!inCompare && compareFull}
                aria-pressed={inCompare}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-navy rounded-lg py-2 text-sm font-semibold hover:bg-navy hover:text-white disabled:opacity-40 transition-colors"
              >
                <GitCompare className="h-4 w-4" aria-hidden="true" />
                {inCompare ? "In Compare" : "Compare"}
              </button>
            </div>

            <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4" aria-hidden="true" /> Enquire about this vehicle
            </h2>
            <EnquiryForm
              vehicleId={vehicle.id}
              locationId={locationId}
              vehicleLabel={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            />

            <Link
              href={`/book-test-drive?vehicleId=${vehicle.id}`}
              className="mt-4 flex items-center justify-center gap-2 border-2 border-accent text-accent rounded-lg py-2.5 text-sm font-semibold hover:bg-accent hover:text-white transition-colors"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" /> Book a Test Drive
            </Link>
            <Link
              href="/trade-in"
              className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent"
            >
              <Repeat className="h-4 w-4" aria-hidden="true" /> Got a trade-in?
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-surface border-t border-border p-3 flex gap-2 z-30">
        <a
          href="#enquire-mobile"
          className="flex-1 bg-accent text-white rounded-lg py-3 text-center font-semibold text-sm hover:bg-accent-hover"
        >
          <Mail className="inline h-4 w-4 mr-1" aria-hidden="true" /> Enquire Now
        </a>
        <Link
          href={`/book-test-drive?vehicleId=${vehicle.id}`}
          className="flex-1 border-2 border-navy text-navy rounded-lg py-3 text-center font-semibold text-sm hover:bg-navy hover:text-white transition-colors"
        >
          Test Drive
        </Link>
        <a
          href="tel:+6491234567"
          className="flex items-center justify-center border-2 border-navy text-navy rounded-lg px-3 hover:bg-navy hover:text-white transition-colors"
          aria-label="Call us"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      {/* Mobile enquiry form */}
      <div id="enquire-mobile" className="lg:hidden mt-10 bg-surface border border-border rounded-xl p-6">
        <h2 className="font-heading font-semibold text-lg mb-4">Enquire about this vehicle</h2>
        <EnquiryForm
          vehicleId={vehicle.id}
          locationId={locationId}
          vehicleLabel={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        />
        <Link
          href={`/book-test-drive?vehicleId=${vehicle.id}`}
          className="mt-4 flex items-center justify-center gap-2 border-2 border-accent text-accent rounded-lg py-2.5 text-sm font-semibold hover:bg-accent hover:text-white transition-colors"
        >
          <Calendar className="h-4 w-4" aria-hidden="true" /> Book a Test Drive
        </Link>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen photo viewer"
        >
          <button
            onClick={() => setLightbox(false)}
            aria-label="Close"
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-2"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/30 rounded-full p-2"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/30 rounded-full p-2"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </>
          )}
          <Image
            src={images[activeImage].url}
            alt={images[activeImage].alt}
            className="max-h-full max-w-full object-contain"
            width={1920}
            height={1080}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {activeImage + 1} / {images.length}
          </p>
        </div>
      )}
    </div>
  );
}
