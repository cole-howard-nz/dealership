"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { TextField, SelectField, CheckboxField, TextAreaField } from "../../../components/FormFields";
import { Button } from "../../../components/Button";
import { EMAIL_REGEX, NZ_PHONE_REGEX } from "../../../lib/format";

const MIN_YEAR = 1980;
const MAX_YEAR = new Date().getFullYear() + 1;

const MODIFICATION_TYPES = [
  { label: "Cosmetic — body kits, wraps, tints, interior trim", value: "Cosmetic" },
  { label: "Performance — engine, exhaust, suspension, brakes", value: "Performance" },
  { label: "Wheels & tyres — aftermarket alloys, tyre upgrades", value: "Wheels & Tyres" },
  { label: "Audio & tech — stereo, screens, cameras", value: "Audio & Tech" },
  { label: "Lift kit / lowered — certified or uncertified", value: "Lift / Lowered" },
  { label: "Towing — tow bar, wiring, weight upgrades", value: "Towing" },
  { label: "Other modifications", value: "Other" },
];

interface Location { id: string; name: string }

interface FormState {
  name: string;
  email: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  plateNumber: string;
  odometerKm: string;
  condition: string;
  isModified: boolean;
  modifications: string[];
  vehicleDescription: string;
  outstandingFinance: boolean;
  preferredContact: string;
  locationId: string;
}

export default function TradeInSubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "",
    vehicleMake: "", vehicleModel: "", vehicleYear: "",
    plateNumber: "",
    odometerKm: "", condition: "",
    isModified: false,
    modifications: [],
    vehicleDescription: "",
    outstandingFinance: false,
    preferredContact: "Phone",
    locationId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    fetch("/api/public/locations")
      .then((r) => r.json())
      .then((data: Location[]) => {
        setLocations(data);
        if (data.length === 1) setForm((f) => ({ ...f, locationId: data[0].id }));
      })
      .catch(() => {});
  }, []);

  function toggleModification(value: string) {
    setForm((f) => ({
      ...f,
      modifications: f.modifications.includes(value)
        ? f.modifications.filter((m) => m !== value)
        : [...f.modifications, value],
    }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.length < 2) e.name = "Enter your full name.";
    if (!EMAIL_REGEX.test(form.email)) e.email = "Enter a valid email address.";
    if (!NZ_PHONE_REGEX.test(form.phone.replace(/\s+/g, ""))) e.phone = "Enter a valid NZ phone number.";
    if (!form.vehicleMake) e.vehicleMake = "Make is required.";
    if (!form.vehicleModel) e.vehicleModel = "Model is required.";
    const year = Number(form.vehicleYear);
    if (!year || year < MIN_YEAR || year > MAX_YEAR)
      e.vehicleYear = `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}.`;
    const odometer = Number(form.odometerKm);
    if (!form.odometerKm || odometer < 0)
      e.odometerKm = "Enter a valid odometer reading.";
    if (!form.condition) e.condition = "Select a condition.";
    if (form.isModified && form.modifications.length === 0)
      e.modifications = "Select at least one modification type.";
    if (!form.locationId) e.locationId = "Please select a location.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/public/trade-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          vehicleYear: Number(form.vehicleYear),
          odometerKm: Number(form.odometerKm),
        }),
      });
      if (!res.ok) throw new Error();
      router.push("/trade-in/success");
    } catch {
      setStatus("error");
    }
  }

  const inputClass = "w-full rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border)] bg-white px-3 py-[9px] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[rgba(220,100,30,0.12)] transition-colors uppercase tracking-widest";

  return (
    <div className="container-wide px-4 py-12">
      <div className="max-w-reading mx-auto">
        <nav className="text-sm text-ink-muted mb-6 flex items-center gap-1" aria-label="Breadcrumb">
          <Link href="/trade-in" className="hover:text-accent">Trade-In</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span aria-current="page">Vehicle details</span>
        </nav>

        <h1 className="font-heading text-3xl font-bold mb-2">Tell us about your vehicle</h1>
        <p className="text-ink-muted mb-8">
          Fill in what you know — we&apos;ll come back with an honest estimate, no obligation.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

          {/* ── Contact details ─────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-heading font-semibold text-base mb-4 pb-2 border-b border-border">Your contact details</h2>
            <div className="flex flex-col gap-4">
              <TextField label="Full name" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} autoComplete="name" />
              <div className="grid sm:grid-cols-2 gap-4">
                <TextField label="Email" type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} autoComplete="email" />
                <TextField label="Phone" type="tel" required value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} hint="e.g. 021 123 4567" />
              </div>
              <SelectField label="Preferred contact method" value={form.preferredContact}
                onChange={(e) => setForm({ ...form, preferredContact: e.target.value })}
                options={[{ label: "Phone", value: "Phone" }, { label: "Email", value: "Email" }]} />
              {locations.length > 1 && (
                <SelectField
                  label="Which location are you submitting to?"
                  required
                  value={form.locationId}
                  onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                  options={locations.map((l) => ({ label: l.name, value: l.id }))}
                  error={errors.locationId}
                />
              )}
            </div>
          </div>

          {/* ── Vehicle details ─────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-heading font-semibold text-base mb-4 pb-2 border-b border-border">Vehicle details</h2>
            <div className="flex flex-col gap-4">

              {/* Make / Model / Year */}
              <div className="grid sm:grid-cols-3 gap-4">
                <TextField label="Make" required placeholder="e.g. Toyota" value={form.vehicleMake}
                  onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} error={errors.vehicleMake} />
                <TextField label="Model" required placeholder="e.g. Hilux" value={form.vehicleModel}
                  onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} error={errors.vehicleModel} />
                <TextField label="Year" type="number" required min={MIN_YEAR} max={MAX_YEAR}
                  placeholder={String(new Date().getFullYear())}
                  value={form.vehicleYear}
                  onChange={(e) => setForm({ ...form, vehicleYear: e.target.value })}
                  error={errors.vehicleYear} />
              </div>

              {/* Plate / Odometer */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Plate number — styled separately for the uppercase plate feel */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1.5">
                    Plate number <span className="normal-case font-normal text-ink-muted/60">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.plateNumber}
                    onChange={(e) => setForm({ ...form, plateNumber: e.target.value.toUpperCase() })}
                    placeholder="ABC123"
                    maxLength={7}
                    className={inputClass}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <p className="text-xs text-ink-muted mt-1">Helps us pull vehicle history faster.</p>
                </div>
                <TextField label="Odometer (km)" type="number" required min={0} value={form.odometerKm}
                  onChange={(e) => setForm({ ...form, odometerKm: e.target.value })} error={errors.odometerKm} />
              </div>

              {/* Condition */}
              <SelectField label="Condition" required value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })} error={errors.condition}
                options={[
                  { label: "Excellent — near-new condition", value: "Excellent" },
                  { label: "Good — minor wear only", value: "Good" },
                  { label: "Fair — some wear or cosmetic issues", value: "Fair" },
                  { label: "Poor — mechanical or major cosmetic issues", value: "Poor" },
                ]} />
            </div>
          </div>

          {/* ── Modifications ───────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-heading font-semibold text-base mb-1">Modifications</h2>
            <p className="text-sm text-ink-muted mb-4">Modifications can affect value — let us know what&apos;s been done.</p>

            <CheckboxField
              label="This vehicle has been modified from stock."
              checked={form.isModified}
              onChange={(e) => setForm({ ...form, isModified: e.target.checked, modifications: [] })}
            />

            {form.isModified && (
              <div className="mt-4 flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-1">
                  Modification types <span className="text-error">*</span>
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {MODIFICATION_TYPES.map((mod) => {
                    const checked = form.modifications.includes(mod.value);
                    return (
                      <button
                        key={mod.value}
                        type="button"
                        onClick={() => toggleModification(mod.value)}
                        aria-pressed={checked}
                        className={`mod-chip${checked ? " mod-chip--active" : ""}`}
                      >
                        {mod.label}
                      </button>
                    );
                  })}
                </div>
                {errors.modifications && (
                  <p className="text-xs text-error mt-1" role="alert">{errors.modifications}</p>
                )}
              </div>
            )}
          </div>

          {/* ── Additional info ─────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-start gap-2 mb-3">
              <Info className="h-4 w-4 text-ink-muted shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="font-heading font-semibold text-base leading-tight">Anything else we should know?</h2>
                <p className="text-sm text-ink-muted mt-0.5">Service history, recent work done, accessories included, known issues.</p>
              </div>
            </div>
            <TextAreaField
              label=""
              value={form.vehicleDescription}
              onChange={(e) => setForm({ ...form, vehicleDescription: e.target.value })}
              placeholder="e.g. Full Toyota service history, new tyres fitted 3 months ago, tow bar included, minor scratch on rear bumper…"
            />
          </div>

          {/* ── Finance & submit ────────────────────────────────── */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-heading font-semibold text-base mb-4 pb-2 border-b border-border">Finance</h2>
            <CheckboxField
              label="This vehicle has outstanding finance (e.g. still being paid off)."
              checked={form.outstandingFinance}
              onChange={(e) => setForm({ ...form, outstandingFinance: e.target.checked })}
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-error" role="alert">Something went wrong. Please try again.</p>
          )}

          <Button type="submit" isLoading={status === "submitting"}>
            Submit for Valuation
          </Button>
        </form>
      </div>

      <style>{`
        .mod-chip {
          display: flex;
          align-items: center;
          text-align: left;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1.5px solid var(--color-border);
          background: var(--color-bg);
          font-size: 0.8rem;
          color: var(--color-ink-muted);
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
          line-height: 1.4;
        }
        .mod-chip:hover {
          border-color: var(--color-ink-muted);
          color: var(--color-ink);
        }
        .mod-chip--active {
          border-color: var(--color-navy);
          background: var(--color-navy);
          color: #fff;
          font-weight: 500;
        }
        .mod-chip--active:hover {
          border-color: var(--color-navy);
          color: #fff;
        }
      `}</style>
    </div>
  );
}