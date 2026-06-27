import Image from "next/image";
import Link from "next/link";

const factors = [
  {
    tag: "01",
    title: "Year & make",
    body: "Newer cars and popular makes hold value better. JDM models with strong demand often surprise on the upside.",
  },
  {
    tag: "02",
    title: "Odometer",
    body: "Lower isn't always better — a well-maintained 120,000km car can be worth more than a neglected 60,000km one.",
  },
  {
    tag: "03",
    title: "Condition",
    body: "Interior, paint, tyre tread, and service records all factor in. We'll ask you for photos so we can be accurate.",
  },
  {
    tag: "04",
    title: "Outstanding finance",
    body: "If there's money still owing on the car, we'll work that into the offer. It doesn't disqualify you.",
  },
];

const howItWorks = [
  {
    num: "1",
    title: "Tell us about your car",
    body: "Make, model, year, odometer reading, and current condition. A few photos help us give a more accurate number.",
  },
  {
    num: "2",
    title: "We assess and respond",
    body: "Usually the same day. We'll send through a written estimate — no vague 'we'll let you know when you come in.'",
  },
  {
    num: "3",
    title: "Use it however you like",
    body: "Put it toward your next car, or just sell it outright. The price is valid for 7 days. No pressure on what you do next.",
  },
];

export default function TradeInPage() {
  return (
    <div className="tradein-page">

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="tradein-hero">
        <div className="tradein-hero-inner container-wide px-4">
          <div className="tradein-hero-copy">
            <div className="eyebrow-accent">Trade-in</div>
            <h1 className="tradein-h1">
              What&apos;s your<br />car actually worth?
            </h1>
            <p className="tradein-hero-sub">
              Get a straight number, not a &quot;come in and we&apos;ll see.&quot; Tell us about your car and we&apos;ll come back with a real estimate — same day, no obligation.
            </p>
            <Link href="/trade-in/submit" className="tradein-btn-primary">
              Get my trade-in value
            </Link>
          </div>
          <div className="tradein-hero-img-wrap">
            <Image
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=640&fit=crop&q=85"
              alt="Person handing over car keys at a dealership trade-in"
              className="tradein-hero-img"
            />
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="section-light">
        <div className="container-wide px-4">
          <div className="mb-12">
            <h2 className="section-heading text-center mb-2">How it works</h2>
            <p className="section-sub-text text-center mx-auto">Three steps, no runaround.</p>
          </div>
          <div className="steps-grid">
            {howItWorks.map((step) => (
              <div key={step.num} className="step-card">
                <div className="step-num">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-body">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT AFFECTS VALUE ───────────────────────────────────── */}
      <section className="section-dark">
        <div className="container-wide px-4">
          <div className="factors-header">
            <h2 className="section-heading-light">What affects your estimate</h2>
            <p className="section-sub-light">
              We look at four main things. The more detail you give us, the more accurate we can be.
            </p>
          </div>

          <div className="factors-grid">
            {factors.map((f) => (
              <div key={f.tag} className="factor-item">
                <div className="factor-top-rule" aria-hidden="true" />
                <div className="factor-content">
                  <span className="factor-tag" aria-hidden="true">{f.tag}</span>
                  <div className="factor-text">
                    <h3 className="factor-title">{f.title}</h3>
                    <p className="factor-body">{f.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ───────────────────────────────────────────── */}
      <section className="tradein-cta-section">
        <div className="container-wide px-4">
          <div className="cta-band">
            <div className="cta-band-copy">
              <p className="cta-band-eyebrow">No obligation</p>
              <h2 className="cta-band-heading">Ready to find out?</h2>
              <p className="cta-band-sub">Takes about 2 minutes. Price held for 7 days.</p>
            </div>
            <div className="cta-band-actions">
              <Link href="/trade-in/submit" className="cta-band-btn-primary">
                Get my trade-in value
              </Link>
              <Link href="/inventory" className="cta-band-btn-ghost">
                Browse replacement cars
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .tradein-page { background: var(--color-bg); }

        /* ─── HERO ── */
        .tradein-hero {
          background: var(--color-navy);
          padding: 5rem 0 4rem;
          overflow: hidden;
        }
        .tradein-hero-inner {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .tradein-hero-inner { grid-template-columns: 1fr 1fr; }
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
        .tradein-h1 {
          font-family: var(--font-sora), sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: #fff;
          margin: 0 0 1.25rem;
        }
        .tradein-hero-sub {
          font-size: 1.05rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.7);
          max-width: 480px;
          margin-bottom: 2rem;
        }
        .tradein-hero-img-wrap {
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 4/3;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .tradein-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tradein-btn-primary {
          display: inline-flex;
          align-items: center;
          background: #E15A2C;
          color: #fff;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 0.875rem 1.75rem;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
        }
        .tradein-btn-primary:hover { background: #C44A21; transform: translateY(-1px); }

        /* ─── SECTIONS ── */
        .section-light { padding: 5rem 0; background: #fff; border-bottom: 1px solid var(--color-border); }
        .section-dark { padding: 5rem 0; background: var(--color-navy); }
        .section-heading {
          font-family: var(--font-sora), sans-serif;
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--color-ink);
          margin: 0 0 0.5rem;
        }
        .section-heading-light {
          font-family: var(--font-sora), sans-serif;
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #fff;
          margin: 0 0 0.5rem;
        }
        .section-sub-text {
          font-size: 0.95rem;
          line-height: 1.65;
          color: var(--color-ink-muted);
          margin: 0;
        }
        .section-sub-light {
          font-size: 0.95rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.6);
          margin: 0;
        }

        /* ─── STEPS ── */
        .steps-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 768px) { .steps-grid { grid-template-columns: repeat(3, 1fr); } }
        .step-card {
          background: var(--color-bg);
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

        /* ─── FACTORS (redesigned) ── */
        .factors-header {
          margin-bottom: 3rem;
        }
        .factors-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
        }
        @media (min-width: 768px) {
          .factors-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .factors-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .factor-item {
          padding: 0 2rem 0 0;
        }
        .factor-item:last-child {
          padding-right: 0;
        }
        @media (max-width: 767px) {
          .factor-item {
            padding: 0;
          }
        }
        .factor-top-rule {
          height: 2px;
          background: #E15A2C;
          margin-bottom: 1.5rem;
          position: relative;
        }
        .factor-content {
          padding-bottom: 2rem;
        }
        .factor-tag {
          display: block;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 0.75rem;
        }
        .factor-text {}
        .factor-title {
          font-family: var(--font-sora), sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.6rem;
          line-height: 1.3;
        }
        .factor-body {
          font-size: 0.875rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.55);
          margin: 0;
        }

        /* ─── CTA BAND ── */
        .tradein-cta-section {
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
        .cta-band-btn-ghost {
          display: inline-flex;
          align-items: center;
          background: transparent;
          color: rgba(255,255,255,0.75);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          border: 1.5px solid rgba(255,255,255,0.2);
          text-decoration: none;
          white-space: nowrap;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .cta-band-btn-ghost:hover {
          border-color: rgba(255,255,255,0.5);
          color: #fff;
          background: rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  );
}