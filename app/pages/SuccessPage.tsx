import { Link } from "react-router-dom";
import { CheckCircle2, Phone } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryTo: string;
}

export function SuccessPage({ title, subtitle, primaryLabel, primaryTo }: Props) {
  return (
    <div className="container-wide px-4 py-24 text-center">
      <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" aria-hidden="true" />
      <h1 className="font-heading text-3xl font-bold">{title}</h1>
      <p className="text-ink-muted mt-3 max-w-reading mx-auto">{subtitle}</p>
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Link to={primaryTo} className="bg-accent text-white rounded-md px-6 py-3 font-semibold hover:bg-accent-hover">{primaryLabel}</Link>
        <a href="tel:+6491234567" className="flex items-center gap-2 border-2 border-navy text-navy rounded-md px-6 py-3 font-semibold hover:bg-navy hover:text-white">
          <Phone className="h-4 w-4" aria-hidden="true" /> Call us
        </a>
      </div>
    </div>
  );
}
