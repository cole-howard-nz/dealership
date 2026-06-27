import Link from "next/link";
import { ShieldCheck, Gauge, FileText, Truck, Award, CheckCircle2 } from "lucide-react";

const INSPECTION_STEPS = [
  {
    icon: FileText,
    title: "Import & history check",
    body: "Before we even look at the vehicle in person, we pull the full import history, odometer records, and ownership trail. If anything doesn't add up, it doesn't go any further.",
  },
  {
    icon: Gauge,
    title: "Mechanical inspection",
    body: "A qualified mechanic checks the engine, transmission, brakes, suspension, tyres, and all fluids. We're looking for anything that'll cost you money after you drive away.",
  },
  {
    icon: ShieldCheck,
    title: "Cosmetic & safety assessment",
    body: "Interior, exterior, and safety systems checked against our condition standard. Anything below 'Good' is either fixed before listing or clearly disclosed in the condition rating.",
  },
  {
    icon: FileText,
    title: "Odometer verification",
    body: "We cross-reference the physical odometer against service records and import history. Every listed odometer reading is verified — not guessed.",
  },
  {
    icon: CheckCircle2,
    title: "Listing approval",
    body: "Only vehicles that pass all four steps go live on the site. The inspection report is available on request for every vehicle we sell.",
  },
];

const TEAM = [
  { name: "Brendan Park", role: "Founder & Head Buyer", bio: "15 years importing vehicles from Japan and the UK. Brendan started Northbridge Motors because he was tired of seeing buyers get burned by hidden faults." },
  { name: "Aroha Williams", role: "Finance Manager", bio: "Former bank lending manager who joined to make vehicle finance straightforward. If it can be financed, Aroha knows how." },
  { name: "Marcus Chen", role: "Head Inspector", bio: "Qualified automotive engineer with a decade of pre-purchase inspection experience. Marcus signs off every vehicle before it's listed." },
];

const HERO_STATS = [
  { value: "100%", label: "of vehicles independently inspected before listing" },
  { value: "5 Step", label: "inspection process, no exceptions" },
  { value: "NZ Wide", label: "delivery on every vehicle we sell" },
  { value: "Same Day", label: "finance pre-approval for most applicants" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-inner container-wide px-4">
          <div className="about-hero-copy">
            <h1 className="about-h1">
              We check every vehicle<br />before you do.
            </h1>
            <p className="about-hero-sub">
              Northbridge Motors was built on a simple idea: if every vehicle is independently
              inspected before listing, buyers don&apos;t have to take our word for it. The report
              is there. The facts are there.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/inventory" className="about-btn-primary">Browse Inventory</Link>
              <Link href="/contact" className="about-btn-ghost">Talk to the team</Link>
            </div>
          </div>

          {/* ── Redesigned RHS: ruled stat list ── */}
          <div className="about-hero-stats-col" aria-label="Key facts">
            {HERO_STATS.map((s) => (
              <div key={s.value} className="about-stat-row">
                <div className="about-stat-rule" aria-hidden="true" />
                <div className="about-stat-inner">
                  <span className="about-stat-value">{s.value}</span>
                  <span className="about-stat-label">{s.label}</span>
                </div>
              </div>
            ))}
            <div className="about-stat-rule about-stat-rule--last" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Inspection process */}
      <section className="container-wide px-4 py-16">
        <div className="max-w-reading mb-10">
          <h2 className="font-heading text-3xl font-bold">Our inspection process</h2>
          <p className="text-ink-muted mt-3">
            Every vehicle goes through five steps before it&apos;s listed. Not most vehicles. Every vehicle.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {INSPECTION_STEPS.map((step, i) => (
            <div key={step.title} className="flex gap-6 items-start bg-surface border border-border rounded-xl p-6">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <step.icon className="h-5 w-5 text-accent" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Step {i + 1}</p>
                <h3 className="font-heading font-semibold text-lg">{step.title}</h3>
                <p className="text-ink-muted mt-1 text-sm leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust pillars */}
      <section className="bg-surface border-y border-border py-16">
        <div className="container-wide px-4">
          <h2 className="font-heading text-3xl font-bold mb-10 text-center">Why buyers choose Northbridge</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center px-4">
              <ShieldCheck className="h-8 w-8 text-accent mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-heading font-semibold text-lg">Transparent pricing</h3>
              <p className="text-sm text-ink-muted mt-2">
                The price you see is the price you pay. No &quot;+ORC&quot; surprises, no hidden dealer fees at the desk.
              </p>
            </div>
            <div className="text-center px-4">
              <Award className="h-8 w-8 text-accent mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-heading font-semibold text-lg">Fast finance decisions</h3>
              <p className="text-sm text-ink-muted mt-2">
                Pre-approval in minutes for most applicants. Know what you&apos;re borrowing before you step foot in the yard.
              </p>
            </div>
            <div className="text-center px-4">
              <Truck className="h-8 w-8 text-accent mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-heading font-semibold text-lg">Nationwide delivery</h3>
              <p className="text-sm text-ink-muted mt-2">
                Can&apos;t come to us? We&apos;ll deliver anywhere in New Zealand. Regional buyers are our most loyal customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container-wide px-4 py-16">
        <div className="max-w-reading mb-10">
          <h2 className="font-heading text-3xl font-bold">The team</h2>
          <p className="text-ink-muted mt-3">
            Small enough that you&apos;ll speak to the same person twice. Big enough to get the job done properly.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {TEAM.map((member) => (
            <div key={member.name} className="bg-surface border border-border rounded-xl p-6">
              <div className="h-12 w-12 rounded-full bg-navy flex items-center justify-center text-white font-heading font-bold text-lg mb-4">
                {member.name.charAt(0)}
              </div>
              <h3 className="font-heading font-semibold">{member.name}</h3>
              <p className="text-xs text-accent font-semibold uppercase tracking-wide mt-0.5">{member.role}</p>
              <p className="text-sm text-ink-muted mt-3 leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section">
        <div className="container-wide px-4">
          <div className="cta-band">
            <div className="cta-band-copy">
              <p className="cta-band-eyebrow">Every car inspected</p>
              <h2 className="cta-band-heading">Ready to find your next vehicle?</h2>
              <p className="cta-band-sub">Every vehicle in our inventory has been through the process above. Come see for yourself.</p>
            </div>
            <div className="cta-band-actions">
              <Link href="/inventory" className="cta-band-btn-primary">Browse Inventory</Link>
              <Link href="/contact" className="cta-band-btn-ghost">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* ── Hero ── */
        .about-hero {
          background: var(--color-navy);
          padding: 5rem 0 4rem;
          overflow: hidden;
        }
        .about-hero-inner {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3.5rem;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .about-hero-inner { grid-template-columns: 1fr 1fr; gap: 5rem; }
        }
        .about-h1 {
          font-family: var(--font-sora), sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: #fff;
          margin: 0 0 1.25rem;
        }
        .about-hero-sub {
          font-size: 1.05rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.7);
          max-width: 480px;
          margin-bottom: 2rem;
        }

        /* ── Stat list (RHS) ── */
        .about-hero-stats-col {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .about-stat-rule {
          height: 1px;
          background: rgba(255,255,255,0.12);
          width: 100%;
        }
        .about-stat-rule--last {
          /* closing rule at bottom */
        }
        .about-stat-row {
          display: flex;
          flex-direction: column;
        }
        .about-stat-inner {
          display: flex;
          align-items: baseline;
          gap: 1.25rem;
          padding: 1.25rem 0;
        }
        .about-stat-value {
          font-family: var(--font-sora), sans-serif;
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 700;
          color: #E15A2C;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: 6rem;
        }
        .about-stat-label {
          font-size: 0.85rem;
          line-height: 1.45;
          color: rgba(255,255,255,0.55);
        }

        /* ── Buttons ── */
        .about-btn-primary {
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
        .about-btn-primary:hover { background: #C44A21; transform: translateY(-1px); }
        .about-btn-ghost {
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
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .about-btn-ghost:hover {
          border-color: rgba(255,255,255,0.5);
          color: #fff;
          background: rgba(255,255,255,0.05);
        }

        /* ── CTA band ── */
        .about-cta-section {
          padding: 5rem 0;
          background: var(--color-bg);
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