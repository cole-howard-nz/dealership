"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TextField, SelectField, CheckboxField } from "../../components/FormFields";
import { Button } from "../../components/Button";
import { EMAIL_REGEX, NZ_PHONE_REGEX } from "../../lib/format";
import type { FinanceApplication } from "../../types";

const STORAGE_KEY = "nb-finance-application-draft";
const STEPS = ["Personal details", "Employment & income", "Loan preferences", "Review & submit"];

type FormState = Omit<FinanceApplication, "termMonths"> & { termMonths: number };

function loadDraft(params: URLSearchParams): FormState {
  const base: FormState = {
    fullName: "", email: "", phone: "", dateOfBirth: "", address: "",
    employmentStatus: "Full-Time", employerName: "", monthlyIncome: 0, timeInRoleMonths: 0,
    vehicleId: params.get("vehicleId") ?? undefined,
    desiredLoanAmount: Number(params.get("price") ?? 0) - Number(params.get("deposit") ?? 0) || 0,
    depositAmount: Number(params.get("deposit") ?? 0),
    termMonths: Number(params.get("term") ?? 60),
    hasTradeIn: false, creditCheckConsent: false, termsAccepted: false,
  };
  if (typeof window !== "undefined") {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return { ...base, ...JSON.parse(saved) };
  }
  return base;
}

function FinanceApplyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => loadDraft(searchParams));
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
      // if (!NZ_PHONE_REGEX.test(form.phone)) e.phone = "Enter a valid NZ phone number.";
      if (!form.dateOfBirth) {
        e.dateOfBirth = "Date of birth is required.";
      } else {
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
      if (!form.desiredLoanAmount || form.desiredLoanAmount <= 0) e.desiredLoanAmount = "Enter the loan amount you need.";
      if (form.depositAmount < 0) e.depositAmount = "Deposit can't be negative.";
    }
    if (step === 3) {
      if (!form.creditCheckConsent) e.creditCheckConsent = "Credit check consent is required to proceed.";
      if (!form.termsAccepted) e.termsAccepted = "Please accept the terms and conditions.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleNext() {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStatus("submitting");
      try {
        await new Promise((r) => setTimeout(r, 1000));
        sessionStorage.removeItem(STORAGE_KEY);
        router.push("/finance/success");
      } catch {
        setStatus("error");
      }
    }
  }

  return (
    <div className="container-wide px-4 py-12">
      <div className="max-w-reading mx-auto">
        <nav className="text-sm text-ink-muted mb-6 flex items-center gap-1" aria-label="Breadcrumb">
          <Link href="/finance" className="hover:text-accent">Finance</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span aria-current="page">Apply</span>
        </nav>

        <h1 className="font-heading text-3xl font-bold mb-2">Finance application</h1>
        <p className="text-ink-muted mb-8">Takes about 5 minutes. Your progress is saved automatically.</p>

        <nav aria-label="Application progress" className="mb-8">
          <ol className="flex items-center gap-0">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      i < step ? "bg-success text-white" : i === step ? "bg-accent text-white" : "bg-border text-ink-muted"
                    }`}
                    aria-current={i === step ? "step" : undefined}
                  >
                    {i < step ? "✓" : i + 1}
                  </span>
                  <span className={`text-sm hidden sm:block ${i === step ? "font-semibold" : "text-ink-muted"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-6 sm:w-10 mx-2 ${i < step ? "bg-success" : "bg-border"}`} />
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="bg-surface border border-border rounded-xl p-6">
          {step === 0 && (
            <fieldset className="flex flex-col gap-5">
              <legend className="font-heading font-semibold text-lg mb-2">Personal details</legend>
              <TextField label="Full name" required value={form.fullName}
                onChange={(e) => update({ fullName: e.target.value })} error={errors.fullName} autoComplete="name" />
              <div className="grid sm:grid-cols-2 gap-5">
                <TextField label="Email" type="email" required value={form.email}
                  onChange={(e) => update({ email: e.target.value })} error={errors.email} autoComplete="email" />
                <TextField label="Phone" type="tel" required value={form.phone}
                  onChange={(e) => update({ phone: e.target.value })} error={errors.phone} autoComplete="tel" hint="e.g. 021 123 4567" />
              </div>
              <TextField label="Date of birth" type="date" required value={form.dateOfBirth}
                onChange={(e) => update({ dateOfBirth: e.target.value })} error={errors.dateOfBirth} />
              <TextField label="Current address" required value={form.address}
                onChange={(e) => update({ address: e.target.value })} error={errors.address} autoComplete="street-address" />
            </fieldset>
          )}

          {step === 1 && (
            <fieldset className="flex flex-col gap-5">
              <legend className="font-heading font-semibold text-lg mb-2">Employment & income</legend>
              <SelectField label="Employment status" required value={form.employmentStatus}
                onChange={(e) => update({ employmentStatus: e.target.value as FinanceApplication["employmentStatus"] })}
                options={["Full-Time", "Part-Time", "Self-Employed", "Other"].map((v) => ({ label: v, value: v }))} />
              <TextField label="Employer / business name" value={form.employerName ?? ""}
                onChange={(e) => update({ employerName: e.target.value })} />
              <div className="grid sm:grid-cols-2 gap-5">
                <TextField label="Monthly income (before tax)" type="number" required min={0} value={form.monthlyIncome || ""}
                  onChange={(e) => update({ monthlyIncome: Number(e.target.value) })} error={errors.monthlyIncome}
                  hint="Wages, self-employment, or benefits" />
                <TextField label="Time in current role (months)" type="number" required min={0} value={form.timeInRoleMonths || ""}
                  onChange={(e) => update({ timeInRoleMonths: Number(e.target.value) })} error={errors.timeInRoleMonths} />
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="flex flex-col gap-5">
              <legend className="font-heading font-semibold text-lg mb-2">Loan preferences</legend>
              <div className="grid sm:grid-cols-2 gap-5">
                <TextField label="Loan amount needed ($)" type="number" required min={0} value={form.desiredLoanAmount || ""}
                  onChange={(e) => update({ desiredLoanAmount: Number(e.target.value) })} error={errors.desiredLoanAmount} />
                <TextField label="Deposit amount ($)" type="number" min={0} value={form.depositAmount || ""}
                  onChange={(e) => update({ depositAmount: Number(e.target.value) })} error={errors.depositAmount} hint="Leave 0 if no deposit" />
              </div>
              <SelectField label="Loan term" required value={String(form.termMonths)}
                onChange={(e) => update({ termMonths: Number(e.target.value) })}
                options={[12, 24, 36, 48, 60].map((t) => ({ label: `${t} months`, value: String(t) }))} />
              <CheckboxField label="I have a vehicle to trade in."
                checked={form.hasTradeIn}
                onChange={(e) => update({ hasTradeIn: e.target.checked })} />
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="flex flex-col gap-5">
              <legend className="font-heading font-semibold text-lg mb-2">Review & submit</legend>
              <div className="bg-bg border border-border rounded-lg p-4 text-sm flex flex-col gap-2">
                <div className="flex justify-between"><span className="text-ink-muted">Name</span><span className="font-medium">{form.fullName}</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Email</span><span className="font-medium">{form.email}</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Employment</span><span className="font-medium">{form.employmentStatus}</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Monthly income</span><span className="font-medium">${form.monthlyIncome.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Loan amount</span><span className="font-medium">${form.desiredLoanAmount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Term</span><span className="font-medium">{form.termMonths} months</span></div>
              </div>
              <p className="text-xs text-ink-muted">Need to change something? Use the Back button to update any step.</p>
              <CheckboxField
                label={<>I consent to a credit check being run as part of this application. <Link href="/privacy" className="text-accent hover:underline">Privacy policy</Link>.</>}
                checked={form.creditCheckConsent}
                onChange={(e) => update({ creditCheckConsent: e.target.checked })}
                error={errors.creditCheckConsent}
              />
              <CheckboxField
                label={<>I accept the <Link href="/terms" className="text-accent hover:underline">terms and conditions</Link>.</>}
                checked={form.termsAccepted}
                onChange={(e) => update({ termsAccepted: e.target.checked })}
                error={errors.termsAccepted}
              />
            </fieldset>
          )}

          {status === "error" && (
            <p className="text-sm text-error mt-4" role="alert">Something went wrong. Your progress is saved — please try again.</p>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="border-2 border-navy text-navy rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-navy hover:text-white transition-colors"
              >
                Back
              </button>
            )}
            <Button onClick={handleNext} isLoading={status === "submitting"} className="flex-1">
              {step < STEPS.length - 1 ? "Continue" : "Submit Application"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinanceApplyPage() {
  return (
    <Suspense fallback={<div className="container-wide px-4 py-12 text-ink-muted">Loading…</div>}>
      <FinanceApplyForm />
    </Suspense>
  );
}
