import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { TextField, TextAreaField, SelectField, CheckboxField } from "./FormFields";
import { Button } from "./Button";
import { EMAIL_REGEX, NZ_PHONE_REGEX } from "../lib/format";
import type { VehicleEnquiry } from "../types";

interface Props {
  vehicleId: string;
  vehicleLabel?: string;
}

type Errors = Partial<Record<keyof VehicleEnquiry, string>>;

export function EnquiryForm({ vehicleLabel }: Props) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", message: "",
    preferredContactMethod: "Phone" as "Phone" | "Email",
    enquiryType: "General" as VehicleEnquiry["enquiryType"],
    consentToContact: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function validateField(field: string, value: any): string {
    switch (field) {
      case "name":
        if (!value || value.length < 2 || value.length > 80) return "Enter a name between 2 and 80 characters.";
        return "";
      case "email":
        if (!EMAIL_REGEX.test(value)) return "Enter a valid email address.";
        return "";
      case "phone":
        if (!NZ_PHONE_REGEX.test(value)) return "Enter a valid NZ phone number, e.g. 021 234 5678 or +64 21 234 5678.";
        return "";
      case "consentToContact":
        if (!value) return "Please consent to being contacted.";
        return "";
      default:
        return "";
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleBlur(field: string, value: any) {
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Errors = {
      name: validateField("name", form.name) || undefined,
      email: validateField("email", form.email) || undefined,
      phone: validateField("phone", form.phone) || undefined,
      consentToContact: validateField("consentToContact", form.consentToContact) || undefined,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 900));
    // Simulated submission — wire to real backend/API when available.
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="bg-success/10 border border-success/30 rounded-md p-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" aria-hidden="true" />
        <h3 className="font-heading font-semibold text-lg">Thanks — we&apos;ve got your enquiry.</h3>
        <p className="text-sm text-ink-muted mt-1">
          A member of our sales team will be in touch by your preferred method shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {vehicleLabel && <p className="text-sm text-ink-muted">Enquiring about: <strong className="text-ink">{vehicleLabel}</strong></p>}

      <TextField label="Full name" required value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        onBlur={(e) => handleBlur("name", e.target.value)} error={errors.name} />

      <TextField label="Email" type="email" required value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        onBlur={(e) => handleBlur("email", e.target.value)} error={errors.email} />

      <TextField label="Phone" type="tel" required value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        onBlur={(e) => handleBlur("phone", e.target.value)} error={errors.phone} />

      <SelectField label="What would you like to know?" value={form.enquiryType}
        onChange={(e) => setForm({ ...form, enquiryType: e.target.value as VehicleEnquiry["enquiryType"] })}
        options={[
          { label: "General enquiry", value: "General" },
          { label: "Pricing", value: "Pricing" },
          { label: "Availability", value: "Availability" },
          { label: "Finance interest", value: "Finance Interest" },
        ]} />

      <TextAreaField label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />

      <fieldset>
        <legend className="text-sm font-semibold mb-2">Preferred contact method</legend>
        <div className="flex gap-4">
          {(["Phone", "Email"] as const).map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm">
              <input type="radio" name="contactMethod" checked={form.preferredContactMethod === m}
                onChange={() => setForm({ ...form, preferredContactMethod: m })} className="accent-accent" />
              {m}
            </label>
          ))}
        </div>
      </fieldset>

      <CheckboxField
        label="I consent to Northbridge Motors contacting me about this enquiry."
        checked={form.consentToContact}
        onChange={(e) => setForm({ ...form, consentToContact: e.target.checked })}
        error={errors.consentToContact}
      />

      {status === "error" && (
        <p className="text-sm text-error" role="alert">Something went wrong sending your enquiry. Please try again.</p>
      )}

      <Button type="submit" isLoading={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send Enquiry"}
      </Button>
    </form>
  );
}
