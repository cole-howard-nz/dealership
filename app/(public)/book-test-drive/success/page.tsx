import Link from "next/link";
import { CheckCircle2, Phone, Calendar } from "lucide-react";

export default function BookTestDriveSuccessPage() {
  return (
    <div className="container-wide px-4 py-24 text-center">
      <div className="max-w-reading mx-auto">
        <CheckCircle2 className="h-14 w-14 text-success mx-auto mb-5" aria-hidden="true" />
        <h1 className="font-heading text-3xl font-bold">Test drive booked</h1>
        <p className="text-ink-muted mt-3 text-lg">
          We've received your booking request. We'll confirm the time by phone or email within one business day.
        </p>

        <div className="mt-8 bg-surface border border-border rounded-xl p-6 text-left max-w-sm mx-auto">
          <h2 className="font-heading font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent" aria-hidden="true" /> What to bring
          </h2>
          <ul className="text-sm text-ink-muted flex flex-col gap-2">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" /> Valid NZ driver's licence</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" /> Comfortable shoes (you're going for a drive!)</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" /> Any questions you want answered in person</li>
          </ul>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link
            href="/inventory"
            className="bg-accent text-white rounded-lg px-6 py-3 font-semibold hover:bg-accent-hover transition-colors"
          >
            Browse more vehicles
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
