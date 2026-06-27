"use client";

import { useTransition, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import {
  BODY_TYPES,
  TRANSMISSIONS,
  FUEL_TYPES,
  DRIVE_TYPES,
  IMPORT_STATUSES,
  CONDITIONS,
  PRICE_NOTES,
} from "../../lib/vehicle-constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VehicleFormDefaults {
  make?: string;
  model?: string;
  variant?: string;
  year?: number;
  bodyType?: string;
  price?: number;
  priceNote?: string;
  odometerKm?: number;
  transmission?: string;
  fuelType?: string;
  engineSizeCc?: number | null;
  driveType?: string;
  colour?: string;
  doors?: number | null;
  seats?: number | null;
  vin?: string;
  importStatus?: string;
  condition?: string;
  features?: string[];
  images?: Array<{ url: string; alt: string; order: number }>;
  description?: string;
  status?: string;
  financeEligible?: boolean;
  inspectionReportUrl?: string | null;
  locationId?: string;
}

interface VehicleFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => Promise<any>;
  defaultValues?: VehicleFormDefaults;
  locations: { id: string; name: string }[];
  mode: "create" | "edit";
  cancelHref: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E4E5E8" }}>
      <div className="px-5 py-3 border-b" style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB" }}>
        <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#5B5F6B" }}>{title}</h2>
      </div>
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function FormField({
  label,
  htmlFor,
  required,
  fullWidth,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : ""}>
      <label htmlFor={htmlFor} className="block text-sm font-medium mb-1" style={{ color: "#5B5F6B" }}>
        {label}
        {required && <span className="ml-0.5" style={{ color: "#E15A2C" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent transition-colors";
const inputStyle = {
  borderColor: "#E4E5E8",
  color: "#13151A",
  // Focus ring via Tailwind `focus:ring-[#E15A2C]` won't work inline; use className
};

// ─── Main component ───────────────────────────────────────────────────────────

export function VehicleForm({ action, defaultValues: d = {}, locations, mode, cancelHref }: VehicleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const imageDefault = Array.isArray(d.images)
    ? d.images.map((i) => i.url).join("\n")
    : "";
  const featuresDefault = Array.isArray(d.features) ? d.features.join("\n") : "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
      // On success: createVehicle redirects server-side; updateVehicle revalidates
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "#FCA5A5", backgroundColor: "#FEF2F2", color: "#DC2626" }}
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Vehicle identity */}
      <FieldGroup title="Identity">
        <FormField label="Make" htmlFor="make" required>
          <input id="make" name="make" type="text" required defaultValue={d.make ?? ""}
            className={inputClass} style={inputStyle} placeholder="e.g. Toyota" />
        </FormField>
        <FormField label="Model" htmlFor="model" required>
          <input id="model" name="model" type="text" required defaultValue={d.model ?? ""}
            className={inputClass} style={inputStyle} placeholder="e.g. Hilux" />
        </FormField>
        <FormField label="Variant" htmlFor="variant">
          <input id="variant" name="variant" type="text" defaultValue={d.variant ?? ""}
            className={inputClass} style={inputStyle} placeholder="e.g. SR5 Hi-Rider (optional)" />
        </FormField>
        <FormField label="Year" htmlFor="year" required>
          <input id="year" name="year" type="number" required defaultValue={d.year ?? new Date().getFullYear()}
            min={1960} max={2030} className={inputClass} style={inputStyle} />
        </FormField>
        <FormField label="VIN" htmlFor="vin" required>
          <input id="vin" name="vin" type="text" required defaultValue={d.vin ?? ""}
            className={inputClass} style={inputStyle} placeholder="Vehicle identification number" />
        </FormField>
        <FormField label="Import Status" htmlFor="importStatus" required>
          <select id="importStatus" name="importStatus" required defaultValue={d.importStatus ?? "NZ New"}
            className={inputClass} style={inputStyle}>
            {IMPORT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
      </FieldGroup>

      {/* Specs */}
      <FieldGroup title="Specifications">
        <FormField label="Body Type" htmlFor="bodyType" required>
          <select id="bodyType" name="bodyType" required defaultValue={d.bodyType ?? ""}
            className={inputClass} style={inputStyle}>
            <option value="" disabled>Select...</option>
            {BODY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Transmission" htmlFor="transmission" required>
          <select id="transmission" name="transmission" required defaultValue={d.transmission ?? ""}
            className={inputClass} style={inputStyle}>
            <option value="" disabled>Select...</option>
            {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Fuel Type" htmlFor="fuelType" required>
          <select id="fuelType" name="fuelType" required defaultValue={d.fuelType ?? ""}
            className={inputClass} style={inputStyle}>
            <option value="" disabled>Select...</option>
            {FUEL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Drive Type" htmlFor="driveType" required>
          <select id="driveType" name="driveType" required defaultValue={d.driveType ?? ""}
            className={inputClass} style={inputStyle}>
            <option value="" disabled>Select...</option>
            {DRIVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Odometer (km)" htmlFor="odometerKm" required>
          <input id="odometerKm" name="odometerKm" type="number" required min={0} defaultValue={d.odometerKm ?? ""}
            className={inputClass} style={inputStyle} />
        </FormField>
        <FormField label="Engine Size (cc)" htmlFor="engineSizeCc">
          <input id="engineSizeCc" name="engineSizeCc" type="number" min={0} defaultValue={d.engineSizeCc ?? ""}
            className={inputClass} style={inputStyle} placeholder="e.g. 2400 (optional)" />
        </FormField>
        <FormField label="Colour" htmlFor="colour" required>
          <input id="colour" name="colour" type="text" required defaultValue={d.colour ?? ""}
            className={inputClass} style={inputStyle} placeholder="e.g. Gunmetal Grey" />
        </FormField>
        <FormField label="Condition" htmlFor="condition" required>
          <select id="condition" name="condition" required defaultValue={d.condition ?? ""}
            className={inputClass} style={inputStyle}>
            <option value="" disabled>Select...</option>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Doors" htmlFor="doors">
          <input id="doors" name="doors" type="number" min={1} max={10} defaultValue={d.doors ?? ""}
            className={inputClass} style={inputStyle} placeholder="Optional" />
        </FormField>
        <FormField label="Seats" htmlFor="seats">
          <input id="seats" name="seats" type="number" min={1} max={20} defaultValue={d.seats ?? ""}
            className={inputClass} style={inputStyle} placeholder="Optional" />
        </FormField>
      </FieldGroup>

      {/* Pricing & Status */}
      <FieldGroup title="Pricing &amp; Status">
        <FormField label="Price (NZD)" htmlFor="price" required>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 text-sm"
              style={{ borderColor: "#E4E5E8", backgroundColor: "#F9FAFB", color: "#5B5F6B" }}>$</span>
            <input id="price" name="price" type="number" required min={0} defaultValue={d.price ?? ""}
              className="flex-1 rounded-l-none rounded-r-lg border px-3 py-2 text-sm focus:outline-none"
              style={{ borderColor: "#E4E5E8", color: "#13151A" }} />
          </div>
        </FormField>
        <FormField label="Price Note" htmlFor="priceNote">
          <select id="priceNote" name="priceNote" defaultValue={d.priceNote ?? ""}
            className={inputClass} style={inputStyle}>
            <option value="">None</option>
            {PRICE_NOTES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </FormField>
        <FormField label="Status" htmlFor="status" required>
          <select id="status" name="status" required defaultValue={d.status ?? "AVAILABLE"}
            className={inputClass} style={inputStyle}>
            <option value="AVAILABLE">Available</option>
            <option value="PENDING">Pending</option>
            <option value="SOLD">Sold</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </FormField>
        <FormField label="Location" htmlFor="locationId" required>
          <select id="locationId" name="locationId" required defaultValue={d.locationId ?? ""}
            className={inputClass} style={inputStyle}>
            <option value="" disabled>Select location...</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </FormField>
        <div className="sm:col-span-2 flex items-center gap-3 pt-1">
          <input id="financeEligible" name="financeEligible" type="checkbox"
            defaultChecked={d.financeEligible !== false}
            className="h-4 w-4 rounded border" style={{ accentColor: "#E15A2C" }} />
          <label htmlFor="financeEligible" className="text-sm font-medium" style={{ color: "#13151A" }}>
            Finance eligible
          </label>
        </div>
      </FieldGroup>

      {/* Content */}
      <FieldGroup title="Content">
        <FormField label="Description" htmlFor="description" required fullWidth>
          <textarea id="description" name="description" required rows={6} defaultValue={d.description ?? ""}
            className={`${inputClass} resize-y`} style={inputStyle}
            placeholder="Full vehicle description shown on the public listing..." />
        </FormField>
        <FormField label="Features (one per line)" htmlFor="features" fullWidth>
          <textarea id="features" name="features" rows={6} defaultValue={featuresDefault}
            className={`${inputClass} resize-y font-mono text-xs`} style={inputStyle}
            placeholder={"Leather seats\nSunroof\nReverse camera\nApple CarPlay"} />
        </FormField>
        <FormField label="Image URLs (one per line)" htmlFor="images" fullWidth>
          <textarea id="images" name="images" rows={4} defaultValue={imageDefault}
            className={`${inputClass} resize-y font-mono text-xs`} style={inputStyle}
            placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"} />
          <p className="mt-1 text-xs" style={{ color: "#9CA3AF" }}>
            Each URL becomes one listing image. Alt text is auto-generated.
          </p>
        </FormField>
        <FormField label="Inspection Report URL" htmlFor="inspectionReportUrl" fullWidth>
          <input id="inspectionReportUrl" name="inspectionReportUrl" type="url"
            defaultValue={d.inspectionReportUrl ?? ""}
            className={inputClass} style={inputStyle} placeholder="https://... (optional)" />
        </FormField>
      </FieldGroup>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end pt-2">
        <button type="button" onClick={() => router.push(cancelHref)}
          className="px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50"
          style={{ borderColor: "#E4E5E8", color: "#5B5F6B" }}>
          Cancel
        </button>
        <button type="submit" disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "#142036" }}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {mode === "create" ? "Add Vehicle" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
