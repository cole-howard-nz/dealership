import Link from "next/link";
import { FinanceCalculator } from "../../components/FinanceCalculator";

const steps = [
  {
    num: "1",
    title: "Use the calculator",
    body: "Punch in the price, what you'd put down, and how long you want to spread it. The estimate is instant and doesn't require any details from you.",
  },
  {
    num: "2",
    title: "Apply online in 5 minutes",
    body: "When you're ready, fill in our short application form. Most people hear back the same day — no phone call needed to get started.",
  },
  {
    num: "3",
    title: "Know before you visit",
    body: "We'll confirm your pre-approval before you make the trip. No awkward surprises at the desk, no hard sell on extras you didn't ask for.",
  },
];

const faqs = [
  {
    q: "What rate should I expect?",
    a: "Rates depend on your credit profile and the vehicle. Our calculator uses an illustrative rate so you can plan — your actual rate comes with your pre-approval. We'll always show the full cost before you commit.",
  },
  {
    q: "Do I need a big deposit?",
    a: "Not necessarily. We work with buyers across a range of deposit amounts. Even 10% gets you a long way. Use the calculator to see what different deposit sizes do to your weekly payments.",
  },
  {
    q: "Will applying affect my credit score?",
    a: "The initial enquiry is a soft check and won't affect your score. A full credit check is only run when you proceed to a formal application, and we'll tell you before that happens.",
  },
  {
    q: "Can I finance a JDM import?",
    a: "Yes. We regularly finance Japanese imports through our lending partners. The vehicle's registration and warrant status just needs to be current, which it will be if it's on our yard.",
  },
];

export default function FinancePage() {
  return (
    <div className="finance-page">

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="finance-hero">
        <div className="finance-hero-inner container-wide px-4">
          <div className="finance-hero-copy">
            <div className="eyebrow-accent">Finance</div>
            <h1 className="finance-h1">
              Know your number<br />before you turn up.
            </h1>
            <p className="finance-hero-sub">
              Pre-approval in minutes. Transparent rate, fees, and total cost upfront — not handed to you at signing. Apply online. No phone call required to get started.
            </p>
            <div className="finance-hero-ctas">
              <Link href="/finance/apply" className="finance-btn-primary">
                Apply for Finance
              </Link>
              <Link href="/inventory" className="finance-btn-ghost">
                Browse cars first
              </Link>
            </div>
          </div>
          <div className="finance-hero-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=640&fit=crop&q=85"
              alt="Car finance paperwork and keys on a desk"
              className="finance-hero-img"
            />
          </div>
        </div>
      </section>

      {/* ─── CALCULATOR ───────────────────────────────────────────── */}
      <section className="calculator-section">
        <div className="container-wide px-4">
          <div className="calculator-grid">
            <div className="calculator-copy">
              <h2 className="section-heading">Estimate your repayments</h2>
              <p className="section-sub-text">
                Adjust the price, deposit, and term. The estimate updates live — no email address, no sales call.
              </p>
              <p className="section-sub-text">
                When the number works for you, hit Apply. The form takes about 5 minutes and we'll come back with a real pre-approval — usually same day.
              </p>
              <div className="calculator-disclaimer">
                All estimates are indicative only. Actual rate and repayments confirmed with your pre-approval.
              </div>
            </div>
            <div>
              <FinanceCalculator defaultPrice={28990} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="steps-section">
        <div className="container-wide px-4">
          <div className="mb-12">
            <h2 className="section-heading text-center mb-2">How it works</h2>
            <p className="section-sub-text text-center mb-12 mx-auto">
              Three steps, no runaround.
            </p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <div key={step.num} className="step-card">
                <div className="step-num">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQs ─────────────────────────────────────────────────── */}
      <section className="faq-section">
        <div className="container-wide px-4">
          <h2 className="section-heading mb-10">Common questions</h2>
          <div className="faq-grid">
            {faqs.map((faq) => (
              <div key={faq.q} className="faq-card">
                <h3 className="faq-q">{faq.q}</h3>
                <p className="faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA STRIP ────────────────────────────────────────────── */}
      <section className="finance-cta-section">
        <div className="container-wide px-4">
          <div className="cta-band">
            <div className="cta-band-copy">
              <p className="cta-band-eyebrow">Soft check only</p>
              <h2 className="cta-band-heading">Ready to get pre-approved?</h2>
              <p className="cta-band-sub">Takes 5 minutes. No hard credit check until you proceed.</p>
            </div>
            <div className="cta-band-actions">
              <Link href="/finance/apply" className="cta-band-btn-primary">
                Start my application
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .finance-page { background: var(--color-bg); }

        /* ─── HERO ──────────────────────────────────────────────── */
        .finance-hero {
          background: var(--color-navy);
          padding: 5rem 0 4rem;
          overflow: hidden;
        }
        .finance-hero-inner {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .finance-hero-inner { grid-template-columns: 1fr 1fr; }
        }
        .finance-hero-img-wrap {
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 4/3;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .finance-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .eyebrow-accent {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #E15A2C;
          margin-bottom: 1rem;
          display: block;
        }
        .finance-h1 {
          font-family: var(--font-sora), sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: #fff;
          margin: 0 0 1.25rem;
        }
        .finance-hero-sub {
          font-size: 1.05rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.7);
          max-width: 520px;
          margin-bottom: 2rem;
        }
        .finance-hero-ctas { display: flex; gap: 1rem; flex-wrap: wrap; }
        .finance-btn-primary {
          background: #E15A2C;
          color: #fff;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.875rem 1.75rem;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
          display: inline-flex;
          align-items: center;
        }
        .finance-btn-primary:hover { background: #C44A21; transform: translateY(-1px); }
        .finance-btn-ghost {
          color: rgba(255,255,255,0.75);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          border: 1.5px solid rgba(255,255,255,0.25);
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s;
          display: inline-flex;
          align-items: center;
        }
        .finance-btn-ghost:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.5);
          color: #fff;
        }

        /* ─── CALCULATOR SECTION ────────────────────────────────── */
        .calculator-section {
          padding: 5rem 0;
          background: #fff;
          border-bottom: 1px solid var(--color-border);
        }
        .calculator-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .calculator-grid { grid-template-columns: 1fr 1fr; align-items: center; }
        }
        .section-heading {
          font-family: var(--font-sora), sans-serif;
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--color-ink);
          margin: 0 0 0.75rem;
        }
        .section-sub-text {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--color-ink-muted);
          margin: 0 0 1rem;
        }
        .calculator-disclaimer {
          font-size: 0.78rem;
          color: var(--color-ink-muted);
          padding: 0.75rem 1rem;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          margin-top: 1.5rem;
        }

        /* ─── STEPS ─────────────────────────────────────────────── */
        .steps-section {
          padding: 5rem 0;
          background: var(--color-bg);
        }
        .steps-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .steps-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .step-card {
          background: #fff;
          border: 1.5px solid var(--color-border);
          border-radius: 12px;
          padding: 2rem;
        }
        .step-num {
          font-family: var(--font-sora), sans-serif;
          font-size: 3rem;
          font-weight: 700;
          color: var(--color-border);
          line-height: 1;
          margin-bottom: 1rem;
        }
        .step-title {
          font-family: var(--font-sora), sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-ink);
          margin: 0 0 0.5rem;
        }
        .step-body {
          font-size: 0.88rem;
          line-height: 1.65;
          color: var(--color-ink-muted);
          margin: 0;
        }

        /* ─── FAQ ───────────────────────────────────────────────── */
        .faq-section {
          padding: 5rem 0;
          background: #fff;
          border-top: 1px solid var(--color-border);
        }
        .faq-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) {
          .faq-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .faq-card {
          padding: 1.75rem;
          background: var(--color-bg);
          border: 1.5px solid var(--color-border);
          border-radius: 12px;
        }
        .faq-q {
          font-family: var(--font-sora), sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-ink);
          margin: 0 0 0.6rem;
        }
        .faq-a {
          font-size: 0.875rem;
          line-height: 1.65;
          color: var(--color-ink-muted);
          margin: 0;
        }

        /* ─── CTA BAND ──────────────────────────────────────────── */
        .finance-cta-section {
          padding: 5rem 0;
          background: var(--color-bg);
          border-top: 1px solid var(--color-border);
        }
        .cta-band {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
          background: var(--color-navy);
          border-radius: 16px;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }
        .cta-band::after {
          content: "";
          position: absolute;
          bottom: -60px; right: -60px;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: rgba(225, 90, 44, 0.07);
          pointer-events: none;
        }
        .cta-band-copy { position: relative; }
        .cta-band-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #E15A2C;
          margin: 0 0 0.5rem;
        }
        .cta-band-heading {
          font-family: var(--font-sora), sans-serif;
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.4rem;
          letter-spacing: -0.02em;
        }
        .cta-band-sub {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.55);
          margin: 0;
        }
        .cta-band-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          position: relative;
          flex-shrink: 0;
        }
        .cta-band-btn-primary {
          display: inline-flex;
          align-items: center;
          background: #E15A2C;
          color: #fff;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.875rem 1.75rem;
          border-radius: 8px;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.15s, transform 0.1s;
        }
        .cta-band-btn-primary:hover { background: #C44A21; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}