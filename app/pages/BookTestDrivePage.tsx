import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TextField, SelectField, CheckboxField } from "../components/FormFields";
import { Button } from "../components/Button";
import { EMAIL_REGEX, NZ_PHONE_REGEX } from "../lib/format";
import { vehicles } from "../data/vehicles";

export function BookTestDrivePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const preselected = params.get("vehicleId");
  const [form, setForm] = useState({
    vehicleId: preselected || "", name: "", email: "", phone: "",
    preferredDate: "", preferredTime: "", location: "Auckland", licenceConfirmed: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  const today = new Date().toISOString().split("T")[0];

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
      navigate("/book-test-drive/success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container-wide px-4 py-10 max-w-reading mx-auto">
      <h1 className="font-heading text-2xl font-semibold mb-2">Book a test drive</h1>
      <p className="text-ink-muted mb-6">No vehicle picked yet? That's fine — pick one from the list below or browse first.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <SelectField label="Vehicle" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
          options={vehicles.filter((v) => v.status === "Available").map((v) => ({ label: `${v.year} ${v.make} ${v.model}`, value: v.id }))} />
        <TextField label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
        <TextField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <TextField label="Phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
        <TextField label="Preferred date" type="date" required min={today} value={form.preferredDate}
          onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} error={errors.preferredDate} />
        <SelectField label="Preferred time" required value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
          options={["Morning", "Afternoon", "Evening"].map((t) => ({ label: t, value: t }))} error={errors.preferredTime} />
        <CheckboxField label="I'll bring a valid driver's licence to the test drive." checked={form.licenceConfirmed}
          onChange={(e) => setForm({ ...form, licenceConfirmed: e.target.checked })} error={errors.licenceConfirmed} />

        {status === "error" && <p className="text-sm text-error" role="alert">Booking failed — please try again.</p>}
        <Button type="submit" isLoading={status === "submitting"}>Confirm Booking</Button>
      </form>
    </div>
  );
}
