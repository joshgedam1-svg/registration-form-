'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, UserCheck, Search, ShieldAlert, LogIn } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/register" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-light-green border border-primary-green/20 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <img src="/logo.svg" alt="Cricket Auction League Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-brand-dark tracking-tight">Cricket Auction League</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-light-green text-primary-green border border-primary-green/20">
                2026
              </span>
            </div>
            <p className="text-xs text-brand-muted hidden sm:block">Official Tournament Player Registration</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="flex items-center gap-3">
          <Link
            href="/register"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/register'
                ? 'bg-light-green text-primary-green font-semibold'
                : 'text-brand-muted hover:text-brand-dark hover:bg-gray-100'
            }`}
          >
            Register
          </Link>
          <Link
            href="/track-status"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/track-status'
                ? 'bg-light-green text-primary-green font-semibold'
                : 'text-brand-muted hover:text-brand-dark hover:bg-gray-100'
            }`}
          >
            Track Status
          </Link>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-green border border-primary-green/30 hover:bg-light-green transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

