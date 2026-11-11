'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserPlus, Search, ShieldCheck } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border py-2 px-6 flex justify-around items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <Link
        href="/register"
        className={`flex flex-col items-center gap-1 py-1 text-xs font-medium transition-colors ${
          pathname === '/register' ? 'text-primary-green font-bold' : 'text-brand-muted hover:text-brand-dark'
        }`}
      >
        <UserPlus className="w-5 h-5" />
        <span>Register</span>
      </Link>

      <Link
        href="/track-status"
        className={`flex flex-col items-center gap-1 py-1 text-xs font-medium transition-colors ${
          pathname === '/track-status' ? 'text-primary-green font-bold' : 'text-brand-muted hover:text-brand-dark'
        }`}
      >
        <Search className="w-5 h-5" />
        <span>Track Status</span>
      </Link>

      <Link
        href="/admin/dashboard"
        className={`flex flex-col items-center gap-1 py-1 text-xs font-medium transition-colors ${
          pathname.startsWith('/admin') ? 'text-primary-green font-bold' : 'text-brand-muted hover:text-brand-dark'
        }`}
      >
        <ShieldCheck className="w-5 h-5" />
        <span>Admin</span>
      </Link>
    </nav>
  );
}

