import Link from "next/link";
import { CheckCircle2, Phone } from "lucide-react";

export default function EnquirySuccessPage() {
  return (
    <div className="container-wide px-4 py-24 text-center">
      <div className="max-w-reading mx-auto">
        <CheckCircle2 className="h-14 w-14 text-success mx-auto mb-5" aria-hidden="true" />
        <h1 className="font-heading text-3xl font-bold">Enquiry sent</h1>
        <p className="text-ink-muted mt-3 text-lg">
          We've received your enquiry and will be in touch during business hours — usually within a few hours.
        </p>
        <p className="text-sm text-ink-muted mt-2">
          Mon–Fri 8:30am–5:30pm · Sat 9am–4pm
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link
            href="/inventory"
            className="bg-accent text-white rounded-lg px-6 py-3 font-semibold hover:bg-accent-hover transition-colors"
          >
            Browse more inventory
          </Link>
          <a
            href="tel:+6491234567"
            className="flex items-center gap-2 border-2 border-navy text-navy rounded-lg px-6 py-3 font-semibold hover:bg-navy hover:text-white transition-colors"
          >
            <Phone className="h-4 w-4" aria-hidden="true" /> Call us directly
          </a>
        </div>
      </div>
    </div>
  );
}
