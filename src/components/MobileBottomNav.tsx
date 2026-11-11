'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserPlus, Search, ShieldCheck, Trophy } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const hasSession = document.cookie.split(';').some(c => c.trim().startsWith('cal_admin_session=true'));
      setIsAdminLoggedIn(hasSession);
    }
  }, [pathname]);

  // Hide on admin routes (AdminLayout has its own responsive sidebar/drawer)
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-4 flex justify-around items-center shadow-lg safe-bottom">
      <Link
        href="/register"
        className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl text-[10px] font-semibold transition-colors ${
          pathname === '/register'
            ? 'text-primary-green'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <div className={`p-1 rounded-md ${pathname === '/register' ? 'bg-light-green text-primary-green' : ''}`}>
          <UserPlus className="w-4 h-4" />
        </div>
        <span>Register</span>
      </Link>

      <Link
        href="/track-status"
        className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl text-[10px] font-semibold transition-colors ${
          pathname === '/track-status'
            ? 'text-primary-green'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <div className={`p-1 rounded-md ${pathname === '/track-status' ? 'bg-light-green text-primary-green' : ''}`}>
          <Search className="w-4 h-4" />
        </div>
        <span>Track Status</span>
      </Link>

      {/* Only show Admin Portal tab to authenticated admins */}
      {isAdminLoggedIn && (
        <Link
          href="/admin/dashboard"
          className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl text-[10px] font-semibold transition-colors ${
            pathname.startsWith('/admin')
              ? 'text-primary-green'
              : 'text-amber-700 hover:text-amber-900'
          }`}
        >
          <div className="p-1 rounded-md bg-amber-50 text-amber-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span>Admin</span>
        </Link>
      )}
    </nav>
  );
}
