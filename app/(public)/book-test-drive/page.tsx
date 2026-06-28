"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { TextField, SelectField, CheckboxField } from "../../components/FormFields";
import { Button } from "../../components/Button";
import { EMAIL_REGEX, NZ_PHONE_REGEX } from "../../lib/format";
import type { Vehicle } from "../../types";

interface Location { id: string; name: string }

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
    locationId: "",
    licenceConfirmed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [locations, setLocations] = useState<Location[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);

  // Load locations
  useEffect(() => {
    fetch("/api/public/locations")
      .then((r) => r.json())
      .then((data: Location[]) => {
        setLocations(data);
        // Auto-select single location only when no vehicle is selected (vehicle provides location)
        if (data.length === 1 && !form.vehicleId) {
          setForm((f) => ({ ...f, locationId: data[0].id }));
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load vehicles
  useEffect(() => {
    fetch("/api/public/vehicles")
      .then((r) => r.json())
      .then((data: Vehicle[]) => {
        const available = data.filter((v) => v.status === "Available");
        setAvailableVehicles(available);
      })
      .catch(() => {});
  }, []);

  // When vehicles load, derive locationId from pre-selected vehicle
  useEffect(() => {
    if (!preselected || availableVehicles.length === 0) return;
    const vehicle = availableVehicles.find((v) => v.id === preselected);
    if (vehicle?.locationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((f) => ({ ...f, locationId: vehicle.locationId! }));
    }
  }, [preselected, availableVehicles]);

  const today = new Date().toISOString().split("T")[0];
  const selectedVehicle = form.vehicleId
    ? availableVehicles.find((v) => v.id === form.vehicleId) ?? null
    : null;

  function handleVehicleChange(vehicleId: string) {
    const vehicle = vehicleId ? availableVehicles.find((v) => v.id === vehicleId) : null;
    setForm((f) => ({
      ...f,
      vehicleId,
      // Derive location from vehicle if available; fall back to single-location auto-select or clear
      locationId: vehicle?.locationId
        ?? (locations.length === 1 ? locations[0].id : ""),
    }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.length < 2) e.name = "Enter your full name.";
    if (!EMAIL_REGEX.test(form.email)) e.email = "Enter a valid email address.";
    if (!NZ_PHONE_REGEX.test(form.phone)) e.phone = "Enter a valid NZ phone number.";
    if (!form.preferredDate || form.preferredDate < today) e.preferredDate = "Choose today or a future date.";
    if (!form.preferredTime) e.preferredTime = "Choose a preferred time.";
    if (!form.locationId) e.locationId = "Please select a location.";
    if (!form.licenceConfirmed) e.licenceConfirmed = "Please confirm you'll bring a valid licence.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/public/test-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
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
          No vehicle picked yet? That&apos;s fine — choose from the list below, or{" "}
          <Link href="/inventory" className="text-accent hover:underline font-medium">browse inventory</Link> first.
          We&apos;ll confirm your booking within one business day.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-surface border border-border rounded-xl p-6" noValidate>
          {/* Vehicle selector */}
          <SelectField
            label="Vehicle (optional)"
            value={form.vehicleId}
            onChange={(e) => handleVehicleChange(e.target.value)}
            options={availableVehicles.map((v) => ({
              label: `${v.year} ${v.make} ${v.model}${v.variant ? " " + v.variant : ""}`,
              value: v.id,
            }))}
          />

          {/* Contact */}
          <div className="grid sm:grid-cols-2 gap-5">
            <TextField label="Full name" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} autoComplete="name" />
            <TextField label="Phone" type="tel" required value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} autoComplete="tel" hint="e.g. 021 123 4567" />
          </div>

          <TextField label="Email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} autoComplete="email" />

          {/* Date / time */}
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

          {/* Location — derived from vehicle when one is selected and has a locationId */}
          {selectedVehicle?.locationId ? (
            <div
              className="flex items-start gap-3 rounded-lg border px-4 py-3"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
            >
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-accent" aria-hidden="true" />
              <p className="text-sm text-ink-muted">
                This vehicle is located at{" "}
                <span className="font-semibold text-ink">{selectedVehicle.location}</span>.
                Your test drive will be arranged there.
              </p>
            </div>
          ) : locations.length > 1 ? (
            <SelectField
              label="Which location?"
              required
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
              options={locations.map((l) => ({ label: l.name, value: l.id }))}
              error={errors.locationId}
            />
          ) : null}

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
