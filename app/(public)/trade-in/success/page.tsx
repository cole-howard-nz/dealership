import Link from "next/link";
import { CheckCircle2, Phone, Clock } from "lucide-react";

export default function TradeInSuccessPage() {
  return (
    <div className="container-wide px-4 py-24 text-center">
      <div className="max-w-reading mx-auto">
        <CheckCircle2 className="h-14 w-14 text-success mx-auto mb-5" aria-hidden="true" />
        <h1 className="font-heading text-3xl font-bold">Valuation request received</h1>
        <p className="text-ink-muted mt-3 text-lg">
          We&apos;ve got your vehicle details. Our team will review them and get back to you with an honest estimate — usually within one business day.
        </p>

        <div className="mt-8 bg-surface border border-border rounded-xl p-6 text-left max-w-sm mx-auto">
          <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" aria-hidden="true" /> What happens next
          </h2>
          <ol className="text-sm text-ink-muted flex flex-col gap-3">
            <li className="flex gap-3">
              <span className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
              We review your vehicle details and market data.
            </li>
            <li className="flex gap-3">
              <span className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
              We contact you with an honest estimate (no obligation).
            </li>
            <li className="flex gap-3">
              <span className="h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
              If you&apos;re happy, we handle the rest — paperwork and all.
            </li>
          </ol>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link
            href="/inventory"
            className="bg-accent text-white rounded-lg px-6 py-3 font-semibold hover:bg-accent-hover transition-colors"
          >
            Browse inventory
          </Link>
          <a
            href="tel:+6491234567"
            className="flex items-center gap-2 border-2 border-navy text-navy rounded-lg px-6 py-3 font-semibold hover:bg-navy hover:text-white transition-colors"
          >
            <Phone className="h-4 w-4" aria-hidden="true" /> Call us
          </a>
        </div>
      </div>
    </div>
  );
}
