"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { TextField, TextAreaField } from "../components/FormFields";
import { Button } from "../components/Button";
import { EMAIL_REGEX, NZ_PHONE_REGEX } from "../lib/format";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.length < 2) e.name = "Enter your full name.";
    if (!EMAIL_REGEX.test(form.email)) e.email = "Enter a valid email address.";
    if (!NZ_PHONE_REGEX.test(form.phone)) e.phone = "Enter a valid NZ phone number.";
    if (!form.message || form.message.length < 5) e.message = "Tell us a little about what you need.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
  }

  return (
    <div className="container-wide px-4 py-12">
      <h1 className="font-heading text-3xl font-bold mb-2">Contact Northbridge Motors</h1>
      <p className="text-ink-muted mb-10 max-w-reading">No need to search for how to reach us — call, message, or visit, whichever's easiest.</p>

      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <div className="flex flex-col gap-5 mb-8">
            <a href="tel:+6491234567" className="flex items-center gap-3 text-lg font-semibold hover:text-accent">
              <Phone className="h-5 w-5 text-accent" aria-hidden="true" /> 09 123 4567
            </a>
            <a href="mailto:sales@northbridgemotors.co.nz" className="flex items-center gap-3 text-ink-muted hover:text-accent">
              <Mail className="h-5 w-5" aria-hidden="true" /> sales@northbridgemotors.co.nz
            </a>
            <p className="flex items-center gap-3 text-ink-muted">
              <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" /> 123 Great South Road, Auckland 1051
            </p>
            <p className="flex items-center gap-3 text-ink-muted">
              <Clock className="h-5 w-5 shrink-0" aria-hidden="true" /> Mon–Fri 8:30am–5:30pm · Sat 9am–4pm
            </p>
          </div>
          <div className="rounded-md overflow-hidden border border-border aspect-[4/3]">
            <iframe
              title="Northbridge Motors location map"
              className="w-full h-full"
              loading="lazy"
              src="https://maps.google.com/maps?q=Auckland%20New%20Zealand&t=&z=13&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-md p-6">
          {status === "success" ? (
            <div className="text-center py-10">
              <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" aria-hidden="true" />
              <h2 className="font-heading font-semibold text-lg">Message sent</h2>
              <p className="text-sm text-ink-muted mt-1">We'll reply during business hours — usually within a few hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <h2 className="font-heading font-semibold text-lg">Send a message</h2>
              <TextField label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <TextField label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
              <TextField label="Phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
              <TextAreaField label="Message" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} error={errors.message} />
              {status === "error" && <p className="text-sm text-error" role="alert">Something went wrong. Please try again.</p>}
              <Button type="submit" isLoading={status === "submitting"}>Send a Message</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
