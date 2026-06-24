"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TextField, SelectField, CheckboxField } from "../../components/FormFields";
import { Button } from "../../components/Button";
import { EMAIL_REGEX, NZ_PHONE_REGEX } from "../../lib/format";

const MIN_YEAR = 1980;
const MAX_YEAR = new Date().getFullYear() + 1;

interface FormState {
  name: string;
  email: string;
  phone: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  odometerKm: string;
  condition: string;
  outstandingFinance: boolean;
  preferredContact: string;
}

export default function TradeInSubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "",
    vehicleMake: "", vehicleModel: "", vehicleYear: "",
    odometerKm: "", condition: "", outstandingFinance: false, preferredContact: "Phone",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.length < 2) e.name = "Enter your full name.";
    if (!EMAIL_REGEX.test(form.email)) e.email = "Enter a valid email address.";
    if (!NZ_PHONE_REGEX.test(form.phone)) e.phone = "Enter a valid NZ phone number.";
    if (!form.vehicleMake) e.vehicleMake = "Make is required.";
    if (!form.vehicleModel) e.vehicleModel = "Model is required.";
    const year = Number(form.vehicleYear);
    if (!year || year < MIN_YEAR || year > MAX_YEAR)
      e.vehicleYear = `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}.`;
    const odometer = Number(form.odometerKm);
    if (!form.odometerKm || odometer < 0)
      e.odometerKm = "Enter a valid odometer reading.";
    if (!form.condition) e.condition = "Select a condition.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    try {
      await new Promise((r) => setTimeout(r, 900));
      router.push("/trade-in/success");
    } catch {
      setStatus("error");
    }
  }

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
          Fill in what you know — we'll come back with an honest estimate, no obligation.
        </p>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-5" noValidate>
          {/* Contact */}
          <div>
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
            </div>
          </div>

          {/* Vehicle details */}
          <div>
            <h2 className="font-heading font-semibold text-base mb-4 pb-2 border-b border-border">Vehicle details</h2>
            <div className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <TextField label="Make" required placeholder="e.g. Toyota" value={form.vehicleMake}
                  onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} error={errors.vehicleMake} />
                <TextField label="Model" required placeholder="e.g. Hilux" value={form.vehicleModel}
                  onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} error={errors.vehicleModel} />
                <TextField label="Year" type="number" required min={MIN_YEAR} max={MAX_YEAR} placeholder={String(new Date().getFullYear())}
                  value={form.vehicleYear} onChange={(e) => setForm({ ...form, vehicleYear: e.target.value })} error={errors.vehicleYear} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <TextField label="Odometer (km)" type="number" required min={0} value={form.odometerKm}
                  onChange={(e) => setForm({ ...form, odometerKm: e.target.value })} error={errors.odometerKm} />
                <SelectField label="Condition" required value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })} error={errors.condition}
                  options={[
                    { label: "Excellent — near-new condition", value: "Excellent" },
                    { label: "Good — minor wear only", value: "Good" },
                    { label: "Fair — some wear or cosmetic issues", value: "Fair" },
                    { label: "Poor — mechanical or major cosmetic issues", value: "Poor" },
                  ]} />
              </div>
              <CheckboxField
                label="This vehicle has outstanding finance (e.g. still being paid off)."
                checked={form.outstandingFinance}
                onChange={(e) => setForm({ ...form, outstandingFinance: e.target.checked })}
              />
            </div>
          </div>

          {status === "error" && (
            <p className="text-sm text-error" role="alert">Something went wrong. Please try again.</p>
          )}

          <Button type="submit" isLoading={status === "submitting"}>
            Submit for Valuation
          </Button>
        </form>
      </div>
    </div>
  );
}
