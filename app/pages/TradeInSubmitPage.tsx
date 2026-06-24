import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, SelectField, CheckboxField } from "../components/FormFields";
import { Button } from "../components/Button";
import { EMAIL_REGEX, NZ_PHONE_REGEX } from "../lib/format";

interface FormState {
  name: string; email: string; phone: string;
  vehicleMake: string; vehicleModel: string; vehicleYear: string;
  odometerKm: string; condition: string; outstandingFinance: boolean;
}

const MIN_YEAR = 1980;
const MAX_YEAR = new Date().getFullYear() + 1;

export function TradeInSubmitPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "", vehicleMake: "", vehicleModel: "", vehicleYear: "",
    odometerKm: "", condition: "", outstandingFinance: false,
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
    if (!year || year < MIN_YEAR || year > MAX_YEAR) e.vehicleYear = `Enter a year between ${MIN_YEAR} and ${MAX_YEAR}.`;
    if (!form.odometerKm || Number(form.odometerKm) < 0) e.odometerKm = "Enter a valid odometer reading.";
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
      navigate("/trade-in/success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container-wide px-4 py-10 max-w-reading mx-auto">
      <h1 className="font-heading text-2xl font-semibold mb-6">Tell us about your vehicle</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
        <TextField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <TextField label="Phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Vehicle make" required value={form.vehicleMake} onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })} error={errors.vehicleMake} />
          <TextField label="Vehicle model" required value={form.vehicleModel} onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })} error={errors.vehicleModel} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Year" type="number" required value={form.vehicleYear} onChange={(e) => setForm({ ...form, vehicleYear: e.target.value })} error={errors.vehicleYear} />
          <TextField label="Odometer (km)" type="number" required value={form.odometerKm} onChange={(e) => setForm({ ...form, odometerKm: e.target.value })} error={errors.odometerKm} />
        </div>
        <SelectField label="Condition" required value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
          options={["Excellent", "Good", "Fair", "Poor"].map((c) => ({ label: c, value: c }))} error={errors.condition} />
        <CheckboxField label="There is outstanding finance on this vehicle" checked={form.outstandingFinance}
          onChange={(e) => setForm({ ...form, outstandingFinance: e.target.checked })} />
        <p className="text-sm text-ink-muted">Photo upload (optional, up to 6 photos, 5MB each) will be available once connected to a backend.</p>

        {status === "error" && <p className="text-sm text-error" role="alert">Submission failed — please try again.</p>}
        <Button type="submit" isLoading={status === "submitting"}>Submit Vehicle Details</Button>
      </form>
    </div>
  );
}
