'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-24">
      <div className="container-wide px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <p className="font-heading text-xl font-bold">Northbridge <span className="text-accent">Motors</span></p>
          <p className="text-sm text-white/60 mt-4">
            Independently inspected used and imported vehicles, honestly priced, financed fast, delivered anywhere in NZ.
          </p>
          <a href="tel:+6491234567" className="mt-4 flex items-center gap-2 text-white font-semibold text-base hover:text-accent transition-colors">
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> 09 123 4567
          </a>
        </div>

        <nav aria-label="Inventory">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white mb-4">Inventory</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/inventory" className="text-white/50 hover:text-white transition-colors">Browse Inventory</Link></li>
            <li><Link href="/compare" className="text-white/50 hover:text-white transition-colors">Compare Vehicles</Link></li>
            <li><Link href="/favourites" className="text-white/50 hover:text-white transition-colors">My Favourites</Link></li>
          </ul>
        </nav>

        <nav aria-label="Services">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white mb-4">Services</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/finance" className="text-white/50 hover:text-white transition-colors">Finance</Link></li>
            <li><Link href="/trade-in" className="text-white/50 hover:text-white transition-colors">Trade-In</Link></li>
            <li><Link href="/book-test-drive" className="text-white/50 hover:text-white transition-colors">Book a Test Drive</Link></li>
          </ul>
        </nav>

        <nav aria-label="Company">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white mb-4">Company</h3>
          <ul className="flex flex-col gap-3 text-sm">
            <li><Link href="/about" className="text-white/50 hover:text-white transition-colors">About / Inspection</Link></li>
            <li><Link href="/contact" className="text-white/50 hover:text-white transition-colors">Contact</Link></li>
            <li className="flex items-start gap-2 text-white/50"><MapPin className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" /> 123 Great South Road, Auckland 1051</li>
            <li className="flex items-center gap-2 text-white/50"><Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> <a href="mailto:sales@northbridgemotors.co.nz" className="hover:text-white transition-colors">sales@northbridgemotors.co.nz</a></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="container-wide px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Northbridge Motors. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-accent">Privacy</Link>
            <Link href="/terms" className="hover:text-accent">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
