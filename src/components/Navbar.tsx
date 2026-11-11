'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Search,
  Menu,
  X,
  UserPlus,
  Download,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If in admin routes, AdminLayout handles its own header and sidebar
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return null;
  }

  const navLinks = [
    { label: 'Register Player', href: '/register', icon: UserPlus },
    { label: 'Track Status', href: '/track-status', icon: Search },
    { label: 'Admin Portal', href: '/admin/dashboard', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand - Clean & Never Wraps on mobile */}
        <Link href="/register" className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-light-green border border-primary-green/20 flex items-center justify-center p-1.5 shadow-2xs shrink-0">
            <img src="/logo.svg" alt="CAL Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight whitespace-nowrap truncate">
                Cricket Auction League
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-light-green text-primary-green border border-primary-green/20 shrink-0">
                2026
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block leading-tight">
              Official Player Registration & Tournament Docket
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 shrink-0">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-light-green text-primary-green border border-primary-green/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Right Controls: Admin Quick Pill + Hamburger Button */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-primary-green bg-light-green border border-primary-green/20"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/98 px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-light-green text-primary-green border border-primary-green/20'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary-green" />
                  <span>{link.label}</span>
                </div>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-primary-green" />}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>CAL 2026 PWA Mobile Edition</span>
            <span className="text-emerald-700 font-semibold">100% App Ready</span>
          </div>
        </div>
      )}
    </header>
  );
}
