import Link from "next/link";
import { ShieldCheck, Gauge, FileText, Users, Truck, Award, CheckCircle2 } from "lucide-react";

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

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white py-16">
        <div className="container-wide px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-heading text-4xl font-bold leading-tight">
              We check every vehicle before you do.
            </h1>
            <p className="text-white/80 mt-4 text-lg leading-relaxed">
              Northbridge Motors was built on a simple idea: if every vehicle is independently
              inspected before listing, buyers don't have to take our word for it. The report
              is there. The facts are there.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/inventory"
                className="bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg px-6 py-3 transition-colors"
              >
                Browse Inventory
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white/60 hover:border-white text-white font-semibold rounded-lg px-6 py-3 transition-colors"
              >
                Talk to the team
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { stat: "100%", label: "of vehicles independently inspected" },
              { stat: "5-step", label: "inspection before any listing goes live" },
              { stat: "NZ-wide", label: "delivery on every vehicle we sell" },
              { stat: "No-pressure", label: "finance — get pre-approved before you visit" },
            ].map(({ stat, label }) => (
              <div key={stat} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="font-heading text-2xl font-bold text-accent">{stat}</p>
                <p className="text-sm text-white/70 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inspection process */}
      <section className="container-wide px-4 py-16">
        <div className="max-w-reading mb-10">
          <h2 className="font-heading text-3xl font-bold">Our inspection process</h2>
          <p className="text-ink-muted mt-3">
            Every vehicle goes through five steps before it's listed. Not most vehicles. Every vehicle.
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
                The price you see is the price you pay. No "+ORC" surprises, no hidden dealer fees at the desk.
              </p>
            </div>
            <div className="text-center px-4">
              <Award className="h-8 w-8 text-accent mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-heading font-semibold text-lg">Fast finance decisions</h3>
              <p className="text-sm text-ink-muted mt-2">
                Pre-approval in minutes for most applicants. Know what you're borrowing before you step foot in the yard.
              </p>
            </div>
            <div className="text-center px-4">
              <Truck className="h-8 w-8 text-accent mx-auto mb-3" aria-hidden="true" />
              <h3 className="font-heading font-semibold text-lg">Nationwide delivery</h3>
              <p className="text-sm text-ink-muted mt-2">
                Can't come to us? We'll deliver anywhere in New Zealand. Regional buyers are our most loyal customers.
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
            Small enough that you'll speak to the same person twice. Big enough to get the job done properly.
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
      <section className="bg-navy text-white py-16">
        <div className="container-wide px-4 text-center">
          <Users className="h-8 w-8 text-accent mx-auto mb-4" aria-hidden="true" />
          <h2 className="font-heading text-2xl font-bold mb-3">Ready to find your next vehicle?</h2>
          <p className="text-white/70 mb-8">Every vehicle in our inventory has been through the process above. Come see for yourself.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/inventory" className="bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg px-6 py-3 transition-colors">
              Browse Inventory
            </Link>
            <Link href="/contact" className="border-2 border-white/60 hover:border-white text-white font-semibold rounded-lg px-6 py-3 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
