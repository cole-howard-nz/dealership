'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-24">
      <div className="container-wide px-4 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <p className="font-heading text-xl font-bold">Northbridge <span className="text-accent">Motors</span></p>
          <p className="text-sm text-white/70 mt-4">
            Independently inspected used and imported vehicles, honestly priced, financed fast, delivered anywhere in NZ.
          </p>
        </div>

        <nav aria-label="Inventory">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60 mb-4">Inventory</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/inventory" className="hover:text-accent">Browse Inventory</Link></li>
            <li><Link href="/compare" className="hover:text-accent">Compare Vehicles</Link></li>
            <li><Link href="/favourites" className="hover:text-accent">My Favourites</Link></li>
          </ul>
        </nav>

        <nav aria-label="Buy with us">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60 mb-4">Buy With Us</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/finance" className="hover:text-accent">Finance</Link></li>
            <li><Link href="/trade-in" className="hover:text-accent">Trade-In</Link></li>
            <li><Link href="/book-test-drive" className="hover:text-accent">Book a Test Drive</Link></li>
            <li><Link href="/about" className="hover:text-accent">About / Inspection Process</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60 mb-4">Visit Us</h3>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" /> 123 Great South Road, Auckland 1051</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> <a href="tel:+6491234567" className="hover:text-accent">09 123 4567</a></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> <a href="mailto:sales@northbridgemotors.co.nz" className="hover:text-accent">sales@northbridgemotors.co.nz</a></li>
          </ul>
        </div>
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
