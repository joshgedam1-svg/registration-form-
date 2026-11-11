'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Radio,
  ExternalLink
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login page, render children directly
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Player Management', href: '/admin/players', icon: Users },
    { label: 'Payment Verification', href: '/admin/payments', icon: CreditCard },
    { label: 'Cricket Statistics', href: '/admin/statistics', icon: BarChart3 },
    { label: 'Tournament Settings', href: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    document.cookie = 'cal_admin_session=; path=/; max-age=0';
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row">
      {/* ============================================================================== */}
      {/* DESKTOP SIDEBAR */}
      {/* ============================================================================== */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-brand-border shrink-0 fixed inset-y-0 z-30">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-brand-border">
          <div className="w-9 h-9 rounded-full bg-light-green border border-primary-green/20 flex items-center justify-center p-1.5 shadow-sm">
            <img src="/logo.svg" alt="League Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-brand-dark leading-tight">Auction League</h2>
            <span className="text-[11px] font-semibold text-primary-green uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Live Realtime Indicator */}
        <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-primary-green font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-green"></span>
            </span>
            <span>Realtime Live</span>
          </div>
          <span className="text-[11px] font-mono text-brand-muted">v1.0</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-light-green text-primary-green font-semibold border border-primary-green/20'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-green' : 'text-brand-muted'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-brand-border space-y-2">
          <Link
            href="/register"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-brand-muted hover:text-brand-dark hover:bg-gray-100 transition-colors"
          >
            <span>Public Registration Form</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================================== */}
      {/* MOBILE TOP BAR */}
      {/* ============================================================================== */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-brand-border h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-light-green border border-primary-green/20 flex items-center justify-center p-1">
            <img src="/logo.svg" alt="League Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-bold text-sm text-brand-dark leading-none block">Admin Portal</span>
            <span className="text-[10px] text-primary-green font-semibold">Cricket Auction League</span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-brand-dark hover:bg-gray-100"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-2xl p-5 space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-bold text-sm text-brand-dark">Admin Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-brand-muted hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-light-green text-primary-green font-semibold border border-primary-green/20'
                        : 'text-brand-dark hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-primary-green" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <Link
                href="/register"
                target="_blank"
                className="text-xs text-brand-muted hover:text-primary-green flex items-center gap-1 font-medium"
              >
                <span>View Public Form</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-red-600 flex items-center gap-1 p-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================================== */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen min-w-0">
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

