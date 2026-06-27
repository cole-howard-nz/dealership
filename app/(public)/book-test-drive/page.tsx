"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { TextField, SelectField, CheckboxField } from "../../components/FormFields";
import { Button } from "../../components/Button";
import { EMAIL_REGEX, NZ_PHONE_REGEX } from "../../lib/format";
import { vehicles } from "../../data/vehicles";

function BookTestDriveForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselected = searchParams.get("vehicleId") ?? "";

  const [form, setForm] = useState({
    vehicleId: preselected,
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
    location: "Auckland",
    licenceConfirmed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  const today = new Date().toISOString().split("T")[0];
  const availableVehicles = vehicles.filter((v) => v.status === "Available");

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.length < 2) e.name = "Enter your full name.";
    if (!EMAIL_REGEX.test(form.email)) e.email = "Enter a valid email address.";
    if (!NZ_PHONE_REGEX.test(form.phone)) e.phone = "Enter a valid NZ phone number.";
    if (!form.preferredDate || form.preferredDate < today) e.preferredDate = "Choose today or a future date.";
    if (!form.preferredTime) e.preferredTime = "Choose a preferred time.";
    if (!form.licenceConfirmed) e.licenceConfirmed = "Please confirm you'll bring a valid licence.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    try {
      await new Promise((r) => setTimeout(r, 900));
      router.push("/book-test-drive/success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container-wide px-4 py-12">
      <div className="max-w-reading mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-6 w-6 text-accent" aria-hidden="true" />
          <h1 className="font-heading text-3xl font-bold">Book a test drive</h1>
        </div>
        <p className="text-ink-muted mb-8">
          No vehicle picked yet? That's fine — choose from the list below, or{" "}
          <Link href="/inventory" className="text-accent hover:underline font-medium">browse inventory</Link> first.
          We'll confirm your booking within one business day.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-surface border border-border rounded-xl p-6" noValidate>
          <SelectField
            label="Vehicle (optional)"
            value={form.vehicleId}
            onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            options={availableVehicles.map((v) => ({
              label: `${v.year} ${v.make} ${v.model}${v.variant ? " " + v.variant : ""}`,
              value: v.id,
            }))}
          />

          <div className="grid sm:grid-cols-2 gap-5">
            <TextField label="Full name" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} autoComplete="name" />
            <TextField label="Phone" type="tel" required value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} autoComplete="tel" hint="e.g. 021 123 4567" />
          </div>

          <TextField label="Email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} autoComplete="email" />

          <div className="grid sm:grid-cols-2 gap-5">
            <TextField label="Preferred date" type="date" required min={today} value={form.preferredDate}
              onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} error={errors.preferredDate} />
            <SelectField label="Preferred time" required value={form.preferredTime}
              onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
              options={[
                { label: "Morning (8:30am – 12pm)", value: "Morning" },
                { label: "Afternoon (12pm – 3:30pm)", value: "Afternoon" },
                { label: "Late afternoon (3:30pm – 5:30pm)", value: "Evening" },
              ]}
              error={errors.preferredTime} />
          </div>

          <CheckboxField
            label="I'll bring a valid NZ driver's licence to the test drive."
            checked={form.licenceConfirmed}
            onChange={(e) => setForm({ ...form, licenceConfirmed: e.target.checked })}
            error={errors.licenceConfirmed}
          />

          {status === "error" && (
            <p className="text-sm text-error" role="alert">Something went wrong. Please try again.</p>
          )}

          <Button type="submit" isLoading={status === "submitting"}>Confirm Booking</Button>
        </form>
      </div>
    </div>
  );
}

export default function BookTestDrivePage() {
  return (
    <Suspense fallback={<div className="container-wide px-4 py-12 text-ink-muted">Loading…</div>}>
      <BookTestDriveForm />
    </Suspense>
  );
}
