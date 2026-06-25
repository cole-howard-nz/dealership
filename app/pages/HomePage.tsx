"use client";

import Link from 'next/link'
import { Zap, Car, Bus, Truck, ShieldCheck, CreditCard } from "lucide-react";
import { vehicles } from "../data/vehicles";
import { VehicleCard } from "../components/VehicleCard";
import { FinanceCalculator } from "../components/FinanceCalculator";

const jdmFeatured = vehicles.filter((v) => v.status === "Available" && v.bodyType === "Performance").slice(0, 3);
const allFeatured = vehicles.filter((v) => v.status === "Available").slice(0, 6);

const categories = [
  { label: "JDM & Performance", type: "Performance", Icon: Zap, desc: "Import legends & track cars" },
  { label: "SUVs", type: "SUV", Icon: Car, desc: "Family-ready, road-ready" },
  { label: "Hatchbacks", type: "Hatchback", Icon: Car, desc: "Practical & fun" },
  { label: "Utes", type: "Ute", Icon: Truck, desc: "Work hard, tow harder" },
  { label: "Vans", type: "Van", Icon: Bus, desc: "Move the whole crew" },
];

const trustPoints = [
  {
    title: "Inspected before it's listed",
    body: "Every car gets a full independent inspection before we put a price on it. The report is yours to read — no charge, no conditions.",
    Icon: ShieldCheck,
  },
  {
    title: "Pre-approval in minutes",
    body: "Know what you'll actually pay before you make the trip. Our finance calculator is honest — not a hook to get you through the door.",
    Icon: CreditCard,
  },
  {
    title: "Delivered to your driveway",
    body: "Can't make it in? We deliver anywhere in NZ. Plenty of our buyers have never set foot in our yard, and they're happy about it.",
    Icon: Truck,
  },
];

export function HomePage() {
  return (
    <div className="homepage">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&q=85"
            alt="JDM sports car — Northbridge Motors performance inventory"
            className="hero-img"
          />
          <div className="hero-overlay" />
        </div>

        <div className="hero-content container-wide px-4">
          <h1 className="hero-heading">
            Every car checked.<br />
            <span className="hero-heading-accent">No surprises.</span>
          </h1>
          <p className="hero-sub">
            We import the cars people actually want, inspect every one properly, and price them straight. Finance sorted online. Delivery anywhere in NZ.
          </p>
          <div className="hero-ctas">
            <Link href="/inventory" className="btn-primary-hero">
              Browse Inventory
            </Link>
            <Link href="/trade-in" className="btn-ghost-hero">
              Trade-In Value →
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">4.8★</span>
              <span className="hero-stat-label">Google reviews</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">16</span>
              <span className="hero-stat-label">Cars available now</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">NZ Wide</span>
              <span className="hero-stat-label">Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORY QUICK PICKS ─────────────────────────────────────────── */}
      <section className="section-gap container-wide px-4">
        <div className="section-header">
          <div>
            <h2 className="section-title">What are you after?</h2>
            <p className="section-sub">Browse by type, or search the full inventory.</p>
          </div>
          <Link href="/inventory" className="browse-link">All cars →</Link>
        </div>
        <div className="category-grid">
          {categories.map(({ label, type, Icon, desc }) => (
            <Link
              key={type}
              href={`/inventory?bodyType=${type}`}
              className="category-card"
            >
              <Icon size={28} aria-hidden="true" className="category-icon" />
              <span className="category-label">{label}</span>
              <span className="category-desc">{desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── JDM SPOTLIGHT ────────────────────────────────────────────────── */}
      {jdmFeatured.length > 0 && (
        <section className="jdm-section">
          <div className="container-wide px-4">
            <div className="section-header">
              <div>
                <div className="eyebrow">Just landed</div>
                <h2 className="section-title-light">JDM &amp; Performance</h2>
                <p className="section-sub-light">Import legends. Road legal, independently inspected, ready to drive.</p>
              </div>
              <Link href="/inventory?bodyType=Performance" className="browse-link-light">View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jdmFeatured.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── FULL FEATURED STOCK ──────────────────────────────────────────── */}
      <section className="section-gap container-wide px-4">
        <div className="section-header">
          <div>
            <h2 className="section-title">Available now</h2>
            <p className="section-sub">Every car on this page is inspected and ready to go.</p>
          </div>
          <Link href="/inventory" className="browse-link">Full inventory →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allFeatured.map((v) => <VehicleCard key={v.id} vehicle={v} />)}
        </div>
        <div className="view-all-cta">
          <Link href="/inventory" className="btn-outline-full">
            See all vehicles →
          </Link>
        </div>
      </section>

      {/* ─── WHY US ───────────────────────────────────────────────────────── */}
      <section className="why-section">
        <div className="container-wide px-4">
          <div className='text-center mb-12'>
            <h2 className="section-title text-center mb-3">Why buy from us</h2>
            <p className="section-sub mx-auto">
              We're not the biggest dealer in NZ. We're the one where nothing is hidden in the footnotes.
            </p>
          </div>
          <div className="trust-grid">
            {trustPoints.map(({ title, body, Icon }) => (
              <div key={title} className="trust-card">
                <Icon size={28} aria-hidden="true" className="trust-icon-svg" />
                <h3 className="trust-title">{title}</h3>
                <p className="trust-body">{body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/about" className="inline-link">
              How our inspection process works →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FINANCE CALCULATOR ───────────────────────────────────────────── */}
      <section className="section-gap container-wide px-4">
        <div className="finance-split">
          <div className="finance-copy">
            <div className="eyebrow-dark">Finance</div>
            <h2 className="section-title">Work out your weekly before you come in</h2>
            <p className="section-body">
              No email required. No sales call triggered. Just a genuine repayment estimate based on the vehicle price, your deposit, and the term you want. When you're ready to apply, it takes about 5 minutes online.
            </p>
            <Link href="/finance" className="inline-link">
              Learn about our finance options →
            </Link>
          </div>
          <div className="finance-widget">
            <FinanceCalculator />
          </div>
        </div>
      </section>

      {/* ─── TRADE-IN ─────────────────────────────────────────────────────── */}
      <section className="tradein-section">
        <div className="container-wide px-4">
          <div className="tradein-split">
            <div className="tradein-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop&q=85"
                alt="Handing over car keys — trade-in valuation"
                className="tradein-img"
              />
            </div>
            <div className="tradein-copy">
              <div className="eyebrow-dark">Trade-in</div>
              <h2 className="section-title">Already have a car?</h2>
              <p className="section-body">
                Tell us what you're driving and we'll come back with a straight number — usually within a few hours. No obligation to buy from us, and no hard sell if you decide not to trade.
              </p>
              <ul className="tradein-list">
                <li>Takes about 2 minutes to fill in</li>
                <li>We'll reply the same day</li>
                <li>Price holds for 7 days</li>
              </ul>
              <Link href="/trade-in" className="btn-primary-dark mt-6 inline-flex">
                Get my trade-in value
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* ─── HERO ──────────────────────────────────────────────────── */
        .hero-section {
          position: relative;
          min-height: 88vh;
          display: flex;
          align-items: center;
          padding-bottom: 0px;
          overflow: hidden;
          min-height: 100vh;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 40%;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(10,15,28,0.92) 0%,
            rgba(10,15,28,0.7) 50%,
            rgba(10,15,28,0.15) 100%
          );
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 640px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }
        .hero-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-accent);
          flex-shrink: 0;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .hero-heading {
          font-family: var(--font-sora), sans-serif;
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin: 0 0 1.25rem;
        }
        .hero-heading-accent {
          color: var(--color-accent);
        }
        .hero-sub {
          font-size: 1.1rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.72);
          margin-bottom: 2rem;
          max-width: 520px;
        }
        .hero-ctas {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }
        .btn-primary-hero {
          background: var(--color-accent);
          color: #fff;
          font-weight: 700;
          font-size: 0.95rem;
          height: 48px;
          padding: 0 1.75rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: background var(--transition-base), transform 0.1s ease;
          display: inline-flex;
          align-items: center;
        }
        .btn-primary-hero:hover { background: var(--color-accent-hover); transform: translateY(-1px); }
        .btn-ghost-hero {
          color: rgba(255,255,255,0.85);
          font-weight: 600;
          font-size: 0.95rem;
          height: 48px;
          padding: 0 1.5rem;
          border-radius: var(--radius-md);
          border: 1.5px solid rgba(255,255,255,0.3);
          text-decoration: none;
          transition: background var(--transition-base), border-color var(--transition-base);
          display: inline-flex;
          align-items: center;
        }
        .btn-ghost-hero:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.55);
        }
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .hero-stat { display: flex; flex-direction: column; }
        .hero-stat-num {
          font-family: var(--font-sora), sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #fff;
          line-height: 1;
        }
        .hero-stat-label {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.55);
          margin-top: 3px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .hero-stat-divider {
          width: 1px;
          height: 32px;
          background: rgba(255,255,255,0.2);
        }

        /* ─── SECTION UTILITIES ─────────────────────────────────────── */
        .section-gap { padding-top: 5rem; padding-bottom: 5rem; }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2.5rem;
          gap: 1rem;
        }
        .section-title {
          font-family: var(--font-sora), sans-serif;
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--color-ink);
          margin: 0;
        }
        .section-title-light {
          font-family: var(--font-sora), sans-serif;
          font-size: clamp(1.5rem, 3vw, 2.25rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #fff;
          margin: 0;
        }
        .section-sub {
          font-size: 0.95rem;
          color: var(--color-ink-muted);
          margin: 0.4rem 0 0;
        }
        .section-sub-light {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.6);
          margin: 0.4rem 0 0;
        }
        .section-body {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--color-ink-muted);
          margin: 1rem 0;
        }
        .eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-accent);
          margin-bottom: 0.5rem;
        }
        .eyebrow-dark {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-accent);
          margin-bottom: 0.5rem;
        }
        .browse-link {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-accent);
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .browse-link:hover { text-decoration: underline; }
        .browse-link-light {
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .browse-link-light:hover { color: #fff; text-decoration: underline; }
        .inline-link {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-accent);
          text-decoration: none;
        }
        .inline-link:hover { text-decoration: underline; }
        .btn-outline-full {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          border: 2px solid var(--color-border);
          color: var(--color-ink);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0 2rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: border-color var(--transition-base), color var(--transition-base);
        }
        .btn-outline-full:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }
        .btn-primary-dark {
          background: var(--color-accent);
          color: #fff;
          font-weight: 700;
          font-size: 0.95rem;
          height: 48px;
          padding: 0 1.75rem;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: background var(--transition-base);
          display: inline-flex;
          align-items: center;
        }
        .btn-primary-dark:hover { background: var(--color-accent-hover); }

        /* ─── CATEGORIES ────────────────────────────────────────────── */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .category-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) {
          .category-grid { grid-template-columns: repeat(5, 1fr); }
        }
        .category-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1.25rem 1rem;
          text-decoration: none;
          transition: border-color var(--transition-base), box-shadow var(--transition-base), transform var(--transition-base);
        }
        .category-card:hover {
          border-color: var(--color-accent);
          box-shadow: var(--shadow-card-hover);
          transform: translateY(-2px);
        }
        .category-icon { color: var(--color-navy); margin-bottom: 2px; }
        .category-label {
          font-family: var(--font-sora), sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-ink);
        }
        .category-desc {
          font-size: 0.78rem;
          color: var(--color-ink-muted);
        }

        /* ─── JDM SECTION ───────────────────────────────────────────── */
        .jdm-section {
          background: var(--color-navy);
          padding: 5rem 0;
        }

        /* ─── VIEW ALL ──────────────────────────────────────────────── */
        .view-all-cta {
          margin-top: 2.5rem;
          text-align: center;
        }

        /* ─── WHY US ────────────────────────────────────────────────── */
        .why-section {
          background: #fff;
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
          padding: 5rem 0;
        }
        .trust-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .trust-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .trust-card {
          padding: 2rem;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-surface);
        }
        .trust-icon-svg { color: var(--color-navy); display: block; margin-bottom: 1rem; }
        .trust-title {
          font-family: var(--font-sora), sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-ink);
          margin: 0 0 0.6rem;
        }
        .trust-body {
          font-size: 0.9rem;
          line-height: 1.65;
          color: var(--color-ink-muted);
          margin: 0;
        }

        /* ─── FINANCE SPLIT ─────────────────────────────────────────── */
        .finance-split {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .finance-split { grid-template-columns: 1fr 1fr; align-items: center; }
        }
        .finance-copy {}
        .finance-widget {}

        /* ─── TRADE-IN ──────────────────────────────────────────────── */
        .tradein-section {
          background: var(--color-bg);
          border-top: 1px solid var(--color-border);
          padding: 5rem 0;
        }
        .tradein-split {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .tradein-split { grid-template-columns: 1fr 1fr; }
        }
        .tradein-img-wrap {
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 4/3;
        }
        .tradein-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .tradein-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .tradein-list li {
          font-size: 0.9rem;
          color: var(--color-ink-muted);
          padding-left: 1.2rem;
          position: relative;
        }
        .tradein-list li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: var(--color-accent);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
