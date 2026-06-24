import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Northbridge Motors collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "1 January 2025";

export default function PrivacyPage() {
  return (
    <div className="container-wide px-4 py-12">
      <div className="max-w-reading mx-auto">
        <h1 className="font-heading text-3xl font-bold">Privacy Policy</h1>
        <p className="text-ink-muted mt-2 text-sm">Last updated: {LAST_UPDATED}</p>

        <div className="prose-like mt-8 flex flex-col gap-8 text-sm leading-relaxed">
          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">1. Who we are</h2>
            <p className="text-ink-muted">
              Northbridge Motors Limited ("we", "us", "our") is a vehicle retailer operating in New Zealand.
              This policy explains how we collect and use personal information in accordance with the New Zealand
              Privacy Act 2020.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">2. Information we collect</h2>
            <p className="text-ink-muted mb-3">We may collect personal information when you:</p>
            <ul className="text-ink-muted flex flex-col gap-2 ml-4">
              <li className="flex gap-2"><span className="text-accent shrink-0">•</span> Submit an enquiry, test drive booking, or contact form</li>
              <li className="flex gap-2"><span className="text-accent shrink-0">•</span> Apply for vehicle finance</li>
              <li className="flex gap-2"><span className="text-accent shrink-0">•</span> Submit a trade-in valuation request</li>
              <li className="flex gap-2"><span className="text-accent shrink-0">•</span> Call or email us directly</li>
              <li className="flex gap-2"><span className="text-accent shrink-0">•</span> Visit our premises</li>
            </ul>
            <p className="text-ink-muted mt-3">
              This may include your name, email address, phone number, date of birth, address, employment details,
              financial information, and vehicle details (for trade-in valuations).
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">3. How we use your information</h2>
            <p className="text-ink-muted mb-3">We use your information to:</p>
            <ul className="text-ink-muted flex flex-col gap-2 ml-4">
              <li className="flex gap-2"><span className="text-accent shrink-0">•</span> Respond to your enquiries and requests</li>
              <li className="flex gap-2"><span className="text-accent shrink-0">•</span> Process finance applications</li>
              <li className="flex gap-2"><span className="text-accent shrink-0">•</span> Provide trade-in valuations</li>
              <li className="flex gap-2"><span className="text-accent shrink-0">•</span> Book and confirm test drives</li>
              <li className="flex gap-2"><span className="text-accent shrink-0">•</span> Comply with legal obligations</li>
            </ul>
            <p className="text-ink-muted mt-3">
              We do not sell your personal information to third parties. We may share information with finance
              lenders as part of a credit application you initiate, or with third parties required to deliver
              legal or regulatory compliance.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">4. Your rights</h2>
            <p className="text-ink-muted">
              Under the Privacy Act 2020, you have the right to access and correct personal information we hold
              about you. To make a request, contact us at{" "}
              <a href="mailto:privacy@northbridgemotors.co.nz" className="text-accent hover:underline">
                privacy@northbridgemotors.co.nz
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">5. Cookies and website data</h2>
            <p className="text-ink-muted">
              This website uses session storage to preserve form data within your browser session (e.g. a
              finance application draft). This data stays on your device and is not transmitted to us until
              you submit a form. We do not use tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">6. Contact</h2>
            <p className="text-ink-muted">
              Questions about this policy? Contact us at{" "}
              <a href="mailto:privacy@northbridgemotors.co.nz" className="text-accent hover:underline">
                privacy@northbridgemotors.co.nz
              </a>{" "}
              or call us on{" "}
              <a href="tel:+6491234567" className="text-accent hover:underline">09 123 4567</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
