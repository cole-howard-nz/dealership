"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { TextField, TextAreaField, SelectField } from "../../components/FormFields";
import { Button } from "../../components/Button";
import { EMAIL_REGEX, NZ_PHONE_REGEX } from "../../lib/format";

interface Location { id: string; name: string }

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", locationId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
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

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.length < 2) e.name = "Enter your full name.";
    if (!EMAIL_REGEX.test(form.email)) e.email = "Enter a valid email address.";
    if (!NZ_PHONE_REGEX.test(form.phone)) e.phone = "Enter a valid NZ phone number.";
    if (!form.message || form.message.length < 5) e.message = "Tell us a little about what you need.";
    if (!form.locationId) e.locationId = "Please select a location.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="contact-page">

      {/* ── Top info strip ───────────────────────────────────────── */}
      <div className="contact-strip">
        <div className="container-wide px-4">
          <div className="contact-strip-inner">
            <a href="tel:+6491234567" className="contact-strip-item">
              <span className="contact-strip-label">Call us</span>
              <span className="contact-strip-value">09 123 4567</span>
            </a>
            <div className="contact-strip-divider" />
            <a href="mailto:sales@northbridgemotors.co.nz" className="contact-strip-item">
              <span className="contact-strip-label">Email</span>
              <span className="contact-strip-value">sales@northbridgemotors.co.nz</span>
            </a>
            <div className="contact-strip-divider" />
            <div className="contact-strip-item">
              <span className="contact-strip-label">Visit</span>
              <span className="contact-strip-value">123 Great South Road, Auckland</span>
            </div>
            <div className="contact-strip-divider" />
            <div className="contact-strip-item">
              <span className="contact-strip-label">Hours</span>
              <span className="contact-strip-value">Mon–Fri 8:30–5:30 · Sat 9–4</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="container-wide px-4">
        <div className="contact-layout">

          {/* LEFT — form */}
          <div className="contact-form-col">
            <div className="contact-heading-wrap">
              <p className="contact-eyebrow">Northbridge Motors</p>
              <h1 className="contact-h1">
                Let&apos;s talk.
              </h1>
              <p className="contact-subhead">
                Whether you&apos;ve found a car you like, have questions about finance, or want a trade-in estimate — drop us a message and we&apos;ll come back to you within the hour during business hours.
              </p>
            </div>

            {status === "success" ? (
              <div className="contact-success">
                <CheckCircle2 className="contact-success-icon" aria-hidden="true" />
                <div>
                  <p className="contact-success-title">Message received</p>
                  <p className="contact-success-body">We&apos;ll be in touch during business hours — usually within the hour.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form" noValidate>
                <div className="contact-form-row">
                  <TextField
                    label="Full name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    error={errors.name}
                  />
                  <TextField
                    label="Phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    error={errors.phone}
                  />
                </div>
                <TextField
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  error={errors.email}
                />
                {locations.length > 1 && (
                  <SelectField
                    label="Which location are you enquiring about?"
                    required
                    value={form.locationId}
                    onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                    options={locations.map((l) => ({ label: l.name, value: l.id }))}
                    error={errors.locationId}
                  />
                )}
                <TextAreaField
                  label="Message"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  error={errors.message}
                />
                {status === "error" && (
                  <p className="text-sm text-error" role="alert">Something went wrong. Please try again.</p>
                )}
                <Button type="submit" isLoading={status === "submitting"}>
                  Send message <ArrowRight className="contact-btn-arrow" aria-hidden="true" />
                </Button>
              </form>
            )}
          </div>

          {/* RIGHT — map + details */}
          <div className="contact-aside">
            <div className="contact-map-wrap">
              <iframe
                title="Northbridge Motors location map"
                className="contact-map"
                loading="lazy"
                src="https://maps.google.com/maps?q=Auckland%20New%20Zealand&t=&z=13&ie=UTF8&iwloc=&output=embed"
              />
            </div>

            <div className="contact-aside-details">
              <div className="contact-detail-row">
                <span className="contact-detail-label">Address</span>
                <span className="contact-detail-value">123 Great South Road<br />Auckland 1051</span>
              </div>
              <div className="contact-detail-divider" />
              <div className="contact-detail-row">
                <span className="contact-detail-label">Weekdays</span>
                <span className="contact-detail-value">8:30am – 5:30pm</span>
              </div>
              <div className="contact-detail-divider" />
              <div className="contact-detail-row">
                <span className="contact-detail-label">Saturday</span>
                <span className="contact-detail-value">9:00am – 4:00pm</span>
              </div>
              <div className="contact-detail-divider" />
              <div className="contact-detail-row">
                <span className="contact-detail-label">Sunday</span>
                <span className="contact-detail-value">Closed</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .contact-page {
          background: var(--color-bg);
          min-height: 100vh;
        }

        /* ── Strip ── */
        .contact-strip {
          background: var(--color-navy);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 0;
        }
        .contact-strip-inner {
          display: flex;
          align-items: stretch;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .contact-strip-inner::-webkit-scrollbar { display: none; }
        .contact-strip-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 14px 24px;
          text-decoration: none;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        a.contact-strip-item:hover { background: rgba(255,255,255,0.04); }
        .contact-strip-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }
        .contact-strip-value {
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(255,255,255,0.85);
        }
        .contact-strip-divider {
          width: 1px;
          background: rgba(255,255,255,0.1);
          flex-shrink: 0;
          align-self: stretch;
          margin: 10px 0;
        }

        /* ── Layout ── */
        .contact-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem;
          padding: 5rem 0 6rem;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .contact-layout {
            grid-template-columns: 1fr 420px;
            gap: 6rem;
          }
        }

        /* ── Form col ── */
        .contact-heading-wrap {
          margin-bottom: 2.5rem;
        }
        .contact-eyebrow {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-accent);
          margin: 0 0 1rem;
        }
        .contact-h1 {
          font-family: var(--font-sora), sans-serif;
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1;
          color: var(--color-ink);
          margin: 0 0 1.25rem;
        }
        .contact-subhead {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--color-ink-muted);
          max-width: 480px;
          margin: 0;
        }

        /* Form */
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 560px;
        }
        .contact-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 500px) {
          .contact-form-row { grid-template-columns: 1fr; }
        }
        .contact-btn-arrow {
          width: 16px;
          height: 16px;
          margin-left: 6px;
          flex-shrink: 0;
        }

        /* Success */
        .contact-success {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: color-mix(in srgb, var(--color-accent) 6%, transparent);
          border: 1.5px solid color-mix(in srgb, var(--color-accent) 20%, transparent);
          border-radius: 10px;
          max-width: 560px;
        }
        .contact-success-icon {
          width: 22px;
          height: 22px;
          color: var(--color-accent);
          flex-shrink: 0;
          margin-top: 1px;
        }
        .contact-success-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--color-ink);
          margin: 0 0 4px;
        }
        .contact-success-body {
          font-size: 0.875rem;
          color: var(--color-ink-muted);
          margin: 0;
          line-height: 1.55;
        }

        /* ── Aside ── */
        .contact-aside {
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 1.5px solid var(--color-border);
          border-radius: 12px;
          overflow: hidden;
          position: sticky;
          top: 7rem;
        }
        .contact-map-wrap {
          aspect-ratio: 4/3;
          overflow: hidden;
        }
        .contact-map {
          width: 100%;
          height: 100%;
          display: block;
          border: none;
          filter: grayscale(20%);
        }

        /* Details below map */
        .contact-aside-details {
          padding: 0;
          background: var(--color-surface);
        }
        .contact-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 14px 20px;
          gap: 1rem;
        }
        .contact-detail-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-ink-muted);
          flex-shrink: 0;
        }
        .contact-detail-value {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-ink);
          text-align: right;
          line-height: 1.45;
        }
        .contact-detail-divider {
          height: 1px;
          background: var(--color-border);
          margin: 0 20px;
        }
      `}</style>
    </div>
  );
}
