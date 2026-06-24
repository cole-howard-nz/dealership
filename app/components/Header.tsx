'use client'

import { useEffect, useState } from "react";
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Phone, Menu, X, Heart, GitCompare } from "lucide-react";
import { useShortlist } from "../hooks/useShortlist";

const DEALER_PHONE = "+6491234567";
const DEALER_PHONE_DISPLAY = "09 123 4567";


const navLinks = [
  { to: "/inventory", label: "Inventory" },
  { to: "/finance", label: "Finance" },
  { to: "/trade-in", label: "Trade-In" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { favourites, compareIds } = useShortlist();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-navy text-white transition-all duration-200 ${
        scrolled ? "py-2 shadow-md" : "py-4"
      }`}
    >
      <div className="container-wide flex items-center justify-between px-4">
        <Link href="/" className="font-heading text-xl font-bold" aria-label="Northbridge Motors home">
          Northbridge <span className="text-accent">Motors</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`text-sm font-medium hover:text-accent transition-colors ${
                pathname === link.to ? "text-accent" : "text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link href="/favourites" className="relative text-white hover:text-accent" aria-label={`Favourites (${favourites.length})`}>
            <Heart className="h-5 w-5" aria-hidden="true" />
            {favourites.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{favourites.length}</span>
            )}
          </Link>
          <Link href="/compare" className="relative text-white hover:text-accent" aria-label={`Compare (${compareIds.length})`}>
            <GitCompare className="h-5 w-5" aria-hidden="true" />
            {compareIds.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">{compareIds.length}</span>
            )}
          </Link>
          <a href={`tel:${DEALER_PHONE}`} className="flex items-center gap-2 text-sm font-semibold hover:text-accent">
            <Phone className="h-4 w-4" aria-hidden="true" /> {DEALER_PHONE_DISPLAY}
          </a>
          <Link
            href="/inventory"
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
          >
            Browse Inventory
          </Link>
        </div>

        <button
          className="lg:hidden text-white"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden flex flex-col gap-4 px-4 pt-4 pb-6 border-t border-white/10 mt-4" aria-label="Mobile">
          {navLinks.map((link) => (
            <Link key={link.to} href={link.to} onClick={() => setMobileOpen(false)} className="text-base font-medium">
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-4 pt-2">
            <Link href="/favourites" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm"><Heart className="h-4 w-4" /> Favourites</Link>
            <Link href="/compare" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-sm"><GitCompare className="h-4 w-4" /> Compare</Link>
          </div>
          <a href={`tel:${DEALER_PHONE}`} className="flex items-center gap-2 text-base font-semibold text-accent">
            <Phone className="h-4 w-4" /> Call {DEALER_PHONE_DISPLAY}
          </a>
        </nav>
      )}
    </header>
  );
}
