import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TextField, SelectField, CheckboxField } from "../components/FormFields";
import { Button } from "../components/Button";
import { EMAIL_REGEX, NZ_PHONE_REGEX } from "../lib/format";
import type { FinanceApplication } from "../types";

const STORAGE_KEY = "nb-finance-application-draft";
const STEPS = ["Personal details", "Employment & income", "Loan preferences", "Consent"];

type FormState = Omit<FinanceApplication, "termMonths"> & { termMonths: number };

function loadDraft(params: URLSearchParams): FormState {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  const base: FormState = {
    fullName: "", email: "", phone: "", dateOfBirth: "", address: "",
    employmentStatus: "Full-Time", employerName: "", monthlyIncome: 0, timeInRoleMonths: 0,
    vehicleId: params.get("vehicleId") || undefined,
    desiredLoanAmount: Number(params.get("price")) - Number(params.get("deposit")) || 0,
    depositAmount: Number(params.get("deposit")) || 0,
    termMonths: Number(params.get("term")) || 60,
    hasTradeIn: false, creditCheckConsent: false, termsAccepted: false,
  };
  if (saved) return { ...base, ...JSON.parse(saved) };
  return base;
}

export function FinanceApplyPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => loadDraft(params));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  function update(patch: Partial<FormState>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (form.fullName.length < 2) e.fullName = "Enter your full name.";
      if (!EMAIL_REGEX.test(form.email)) e.email = "Enter a valid email address.";
      if (!NZ_PHONE_REGEX.test(form.phone)) e.phone = "Enter a valid NZ phone number.";
      if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required.";
      else {
        const age = (Date.now() - new Date(form.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        if (age < 18) e.dateOfBirth = "You must be 18 or older to apply.";
      }
      if (!form.address) e.address = "Address is required.";
    }
    if (step === 1) {
      if (!form.monthlyIncome || form.monthlyIncome <= 0) e.monthlyIncome = "Enter a monthly income greater than 0.";
      if (form.timeInRoleMonths < 0) e.timeInRoleMonths = "Enter a valid number of months.";
    }
    if (step === 2) {
      if (!form.desiredLoanAmount || form.desiredLoanAmount <= 0) e.desiredLoanAmount = "Enter a loan amount greater than 0.";
      if (form.depositAmount < 0) e.depositAmount = "Deposit can't be negative.";
    }
    if (step === 3) {
      if (!form.creditCheckConsent) e.creditCheckConsent = "Consent to a credit check is required.";
      if (!form.termsAccepted) e.termsAccepted = "You must accept the terms to continue.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  }

  async function handleSubmit() {
    setStatus("submitting");
    try {
      await new Promise((r) => setTimeout(r, 900));
      sessionStorage.removeItem(STORAGE_KEY);
      navigate("/finance/success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container-wide px-4 py-10 max-w-reading mx-auto">
      <h1 className="font-heading text-2xl font-semibold mb-2">Finance application</h1>
      <p className="text-sm text-ink-muted mb-6">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>

      <div className="flex gap-1 mb-8" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-border"}`} />
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); next(); }} className="flex flex-col gap-4" noValidate>
        {step === 0 && (
          <>
            <TextField label="Full name" required value={form.fullName} onChange={(e) => update({ fullName: e.target.value })} error={errors.fullName} />
            <TextField label="Email" type="email" required value={form.email} onChange={(e) => update({ email: e.target.value })} error={errors.email} />
            <TextField label="Phone" type="tel" required value={form.phone} onChange={(e) => update({ phone: e.target.value })} error={errors.phone} />
            <TextField label="Date of birth" type="date" required value={form.dateOfBirth} onChange={(e) => update({ dateOfBirth: e.target.value })} error={errors.dateOfBirth} />
            <TextField label="Address" required value={form.address} onChange={(e) => update({ address: e.target.value })} error={errors.address} />
          </>
        )}
        {step === 1 && (
          <>
            <SelectField label="Employment status" required value={form.employmentStatus}
              onChange={(e) => update({ employmentStatus: e.target.value as FormState["employmentStatus"] })}
              options={[
                { label: "Full-Time", value: "Full-Time" }, { label: "Part-Time", value: "Part-Time" },
                { label: "Self-Employed", value: "Self-Employed" }, { label: "Other", value: "Other" },
              ]} />
            <TextField label="Employer name" value={form.employerName} onChange={(e) => update({ employerName: e.target.value })} />
            <TextField label="Monthly income (NZD)" type="number" required value={form.monthlyIncome}
              onChange={(e) => update({ monthlyIncome: Number(e.target.value) })} error={errors.monthlyIncome} />
            <TextField label="Time in current role (months)" type="number" required value={form.timeInRoleMonths}
              onChange={(e) => update({ timeInRoleMonths: Number(e.target.value) })} error={errors.timeInRoleMonths} />
          </>
        )}
        {step === 2 && (
          <>
            <TextField label="Desired loan amount (NZD)" type="number" required value={form.desiredLoanAmount}
              onChange={(e) => update({ desiredLoanAmount: Number(e.target.value) })} error={errors.desiredLoanAmount} />
            <TextField label="Deposit / trade-in amount (NZD)" type="number" value={form.depositAmount}
              onChange={(e) => update({ depositAmount: Number(e.target.value) })} error={errors.depositAmount} />
            <SelectField label="Term (months)" required value={String(form.termMonths)}
              onChange={(e) => update({ termMonths: Number(e.target.value) })}
              options={[12, 24, 36, 48, 60].map((t) => ({ label: String(t), value: String(t) }))} />
            <CheckboxField label="I have a vehicle to trade in" checked={form.hasTradeIn} onChange={(e) => update({ hasTradeIn: e.target.checked })} />
          </>
        )}
        {step === 3 && (
          <>
            <CheckboxField
              label="I consent to a credit check being performed as part of this application."
              checked={form.creditCheckConsent} onChange={(e) => update({ creditCheckConsent: e.target.checked })}
              error={errors.creditCheckConsent}
            />
            <CheckboxField
              label="I have read and accept the finance terms and conditions."
              checked={form.termsAccepted} onChange={(e) => update({ termsAccepted: e.target.checked })}
              error={errors.termsAccepted}
            />
          </>
        )}

        {status === "error" && <p className="text-sm text-error" role="alert">Submission failed — please try again.</p>}

        <div className="flex justify-between mt-4">
          {step > 0 ? (
            <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>
          ) : <span />}
          <Button type="submit" isLoading={status === "submitting"}>
            {step === STEPS.length - 1 ? "Submit Application" : "Continue"}
          </Button>
        </div>
        {step < STEPS.length - 1 && (
          <p className="text-xs text-ink-muted text-center mt-2">Your progress is saved automatically — refreshing won't lose your answers.</p>
        )}
      </form>
    </div>
  );
}
