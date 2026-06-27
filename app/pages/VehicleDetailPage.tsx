import { useState } from "react";
import Image from "next/image";
import { Link, useParams, Navigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Expand, Heart, GitCompare, Gauge, Fuel,
  Calendar, Settings2, ShieldCheck, Mail, Repeat,
} from "lucide-react";
import { getVehicleBySlug, getSimilarVehicles } from "../data/vehicles";
import { formatPrice, formatOdometer } from "../lib/format";
import { Badge } from "../components/Badge";
import { VehicleCard } from "../components/VehicleCard";
import { EnquiryForm } from "../components/EnquiryForm";
import { FinanceCalculator } from "../components/FinanceCalculator";
import { useShortlist } from "../hooks/useShortlist";
import { useToast } from "../hooks/useToast";

export function VehicleDetailPage() {
  const { slug } = useParams();
  const vehicle = slug ? getVehicleBySlug(slug) : undefined;
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const { isFavourited, toggleFavourite, isInCompare, toggleCompare, compareFull } = useShortlist();
  const { showToast } = useToast();

  if (!vehicle) return <Navigate to="/inventory" replace />;

  const images = vehicle.images.length > 0 ? vehicle.images : [{ url: "https://picsum.photos/seed/placeholder/960/640", alt: "Photo coming soon", order: 0 }];
  const similar = getSimilarVehicles(vehicle);
  const favourited = isFavourited(vehicle.id);
  const inCompare = isInCompare(vehicle.id);

  function handleCompareClick() {
    if (!vehicle)
      return
    const result = toggleCompare(vehicle.id);
    showToast(result.ok ? (inCompare ? "Removed from compare" : "Added to compare") : (result.reason ?? ""));
  }

  return (
    <div className="container-wide px-4 py-8 pb-28 lg:pb-8">
      <nav className="text-sm text-ink-muted mb-4 flex items-center gap-1" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-accent">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <Link to="/inventory" className="hover:text-accent">Inventory</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{vehicle.make} {vehicle.model}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* Gallery */}
          <div className="relative rounded-lg overflow-hidden bg-border aspect-[3/2]">
            <Image src={images[activeImage].url} alt={images[activeImage].alt} className="h-full w-full object-cover" />
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                  aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2">
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                  aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2">
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            )}
            <button onClick={() => setLightbox(true)} aria-label="View fullscreen"
              className="absolute bottom-2 right-2 bg-white/90 hover:bg-white rounded-full p-2">
              <Expand className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {images.map((img, i) => (
              <button key={img.url + i} onClick={() => setActiveImage(i)}
                aria-label={`View photo ${i + 1}: ${img.alt}`}
                className={`shrink-0 h-16 w-24 rounded-sm overflow-hidden border-2 ${i === activeImage ? "border-accent" : "border-transparent"}`}>
                <Image src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {/* Title + price */}
          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex gap-2 mb-2">
                {vehicle.status === "Reserved" && <Badge tone="warning">Reserved</Badge>}
                {vehicle.status === "Incoming" && <Badge tone="warning">Coming Soon</Badge>}
                <Badge tone="navy">{vehicle.importStatus}</Badge>
              </div>
              <h1 className="font-heading text-3xl font-bold">{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}</h1>
              <p className="text-ink-muted mt-1">{vehicle.location} · VIN {vehicle.vin}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{formatPrice(vehicle.price)}</p>
              {vehicle.priceNote && <p className="text-sm text-ink-muted">{vehicle.priceNote}</p>}
              <p className="text-sm text-success font-medium mt-1">Delivered anywhere in NZ</p>
            </div>
          </div>

          {/* Key specs */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 bg-surface border border-border rounded-md p-4">
            <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-ink-muted" aria-hidden="true" /><div><dt className="text-xs text-ink-muted">Odometer</dt><dd className="font-semibold text-sm">{formatOdometer(vehicle.odometerKm)}</dd></div></div>
            <div className="flex items-center gap-2"><Fuel className="h-4 w-4 text-ink-muted" aria-hidden="true" /><div><dt className="text-xs text-ink-muted">Fuel</dt><dd className="font-semibold text-sm">{vehicle.fuelType}</dd></div></div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-ink-muted" aria-hidden="true" /><div><dt className="text-xs text-ink-muted">Year</dt><dd className="font-semibold text-sm">{vehicle.year}</dd></div></div>
            <div className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-ink-muted" aria-hidden="true" /><div><dt className="text-xs text-ink-muted">Transmission</dt><dd className="font-semibold text-sm">{vehicle.transmission}</dd></div></div>
          </dl>

          {/* Inspection report */}
          <div className="mt-8 bg-success/5 border border-success/20 rounded-md p-5 flex gap-4 items-start">
            <ShieldCheck className="h-6 w-6 text-success shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-heading font-semibold text-lg">Independently inspected</h2>
              <p className="text-sm text-ink-muted mt-1">
                This vehicle was checked against our {vehicle.condition.toLowerCase()}-condition standard before listing, including odometer verification.
              </p>
              {vehicle.inspectionReportUrl && (
                <a href={vehicle.inspectionReportUrl} className="text-sm font-semibold text-accent hover:underline mt-2 inline-block">
                  View full inspection report
                </a>
              )}
            </div>
          </div>

          {/* Full spec table */}
          <div className="mt-8">
            <h2 className="font-heading font-semibold text-xl mb-4">Full specification</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm border border-border rounded-md p-5 bg-surface">
              {[
                ["Make", vehicle.make], ["Model", vehicle.model], ["Variant", vehicle.variant ?? "—"],
                ["Body type", vehicle.bodyType], ["Drivetrain", vehicle.driveType],
                ["Engine size", vehicle.engineSizeCc ? `${vehicle.engineSizeCc}cc` : "—"],
                ["Colour", vehicle.colour], ["Doors", vehicle.doors ?? "—"], ["Seats", vehicle.seats ?? "—"],
                ["Condition", vehicle.condition], ["Import status", vehicle.importStatus],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between border-b border-border/60 pb-2">
                  <dt className="text-ink-muted">{label}</dt><dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            {vehicle.features.length > 0 && (
              <ul className="grid grid-cols-2 gap-2 mt-4 text-sm">
                {vehicle.features.map((f) => <li key={f} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{f}</li>)}
              </ul>
            )}
            <p className="text-sm text-ink-muted mt-4">{vehicle.description}</p>
          </div>

          {/* Finance estimate */}
          {vehicle.financeEligible && (
            <div className="mt-8">
              <h2 className="font-heading font-semibold text-xl mb-4">Finance estimate</h2>
              <FinanceCalculator defaultPrice={vehicle.price} vehicleId={vehicle.id} />
            </div>
          )}

          {/* Similar vehicles */}
          {similar.length > 0 && (
            <div className="mt-12">
              <h2 className="font-heading font-semibold text-xl mb-4">Similar vehicles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {similar.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
              </div>
            </div>
          )}
        </div>

        {/* CTA panel */}
        <div className="hidden lg:block">
          <div className="sticky top-24 bg-surface border border-border rounded-md p-6">
            <div className="flex gap-2 mb-4">
              <button onClick={() => toggleFavourite(vehicle.id)} aria-pressed={favourited}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-navy rounded-md py-2 text-sm font-semibold hover:bg-navy hover:text-white">
                <Heart className={`h-4 w-4 ${favourited ? "fill-current" : ""}`} aria-hidden="true" /> {favourited ? "Saved" : "Save"}
              </button>
              <button onClick={handleCompareClick} disabled={!inCompare && compareFull} aria-pressed={inCompare}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-navy rounded-md py-2 text-sm font-semibold hover:bg-navy hover:text-white disabled:opacity-40">
                <GitCompare className="h-4 w-4" aria-hidden="true" /> {inCompare ? "In Compare" : "Compare"}
              </button>
            </div>

            <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2"><Mail className="h-4 w-4" aria-hidden="true" /> Enquire about this vehicle</h2>
            <EnquiryForm vehicleId={vehicle.id} vehicleLabel={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />

            <Link
              to="/book-test-drive"
              className="mt-4 flex items-center justify-center gap-2 h-12 border-2 border-navy text-navy rounded-xl text-sm font-semibold transition-colors hover:bg-navy hover:text-white"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" /> Book Test Drive
            </Link>
            <Link to="/trade-in" className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-ink-muted hover:text-accent">
              <Repeat className="h-4 w-4" aria-hidden="true" /> Got a trade-in?
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky mobile action bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-surface border-t border-border p-3 flex gap-2 z-30">
        <a href="#enquire-mobile" className="flex-1 bg-accent text-white rounded-md py-3 text-center font-semibold text-sm">Enquire Now</a>
        <Link to="/book-test-drive" className="flex-1 border-2 border-navy text-navy rounded-md py-3 text-center font-semibold text-sm">Test Drive</Link>
      </div>
      <div id="enquire-mobile" className="lg:hidden mt-10 bg-surface border border-border rounded-md p-6">
        <h2 className="font-heading font-semibold text-lg mb-4">Enquire about this vehicle</h2>
        <EnquiryForm vehicleId={vehicle.id} vehicleLabel={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} />
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Fullscreen photo viewer">
          <button onClick={() => setLightbox(false)} aria-label="Close fullscreen" className="absolute top-4 right-4 text-white text-2xl">×</button>
          <Image src={images[activeImage].url} alt={images[activeImage].alt} className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}
