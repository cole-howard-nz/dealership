import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using the Northbridge Motors website and services.",
};

const LAST_UPDATED = "1 January 2025";

export default function TermsPage() {
  return (
    <div className="container-wide px-4 py-12">
      <div className="max-w-reading mx-auto">
        <h1 className="font-heading text-3xl font-bold">Terms & Conditions</h1>
        <p className="text-ink-muted mt-2 text-sm">Last updated: {LAST_UPDATED}</p>

        <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed">
          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">1. Use of this website</h2>
            <p className="text-ink-muted">
              By using northbridgemotors.co.nz, you agree to these terms. We may update them from time to time;
              continued use of the site after changes means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">2. Vehicle information</h2>
            <p className="text-ink-muted">
              Vehicle listings, specifications, and pricing on this site are provided in good faith and kept as
              accurate as possible. However, errors may occur. All prices are in New Zealand dollars and exclude
              any applicable on-road costs unless stated as &quot;Drive Away.&quot; Prices and availability are subject
              to change without notice. We recommend confirming current details directly with our team before
              travelling to view a vehicle.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">3. Finance calculator</h2>
            <p className="text-ink-muted">
              The finance calculator on this website provides illustrative repayment estimates only, based on an
              example interest rate. Results are not a quote, offer of credit, or pre-approval. Finance is
              subject to lender eligibility criteria. Actual rates and terms will vary. New Zealand Credit
              Contracts and Consumer Finance Act 2003 terms apply.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">4. Trade-in valuations</h2>
            <p className="text-ink-muted">
              Trade-in estimates provided via this website are non-binding and subject to physical inspection of
              the vehicle. The final value offered may differ from any estimate provided online.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">5. Intellectual property</h2>
            <p className="text-ink-muted">
              All content on this site — including text, design, and imagery — is owned by or licensed to
              Northbridge Motors Limited. You may not reproduce or use it for commercial purposes without
              written permission.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">6. Limitation of liability</h2>
            <p className="text-ink-muted">
              To the maximum extent permitted by New Zealand law, Northbridge Motors is not liable for any
              indirect or consequential loss arising from use of this website or reliance on information
              provided herein.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">7. Governing law</h2>
            <p className="text-ink-muted">
              These terms are governed by the laws of New Zealand. Any dispute will be subject to the exclusive
              jurisdiction of the New Zealand courts.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-semibold text-xl mb-3">8. Contact</h2>
            <p className="text-ink-muted">
              Questions about these terms? Email us at{" "}
              <a href="mailto:sales@northbridgemotors.co.nz" className="text-accent hover:underline">
                sales@northbridgemotors.co.nz
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
