import React from 'react';

export function BatIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Cricket Bat */}
      <path d="M19 5l-3-3a1.5 1.5 0 0 0-2.12 0L3.5 12.38a2.5 2.5 0 0 0 0 3.54l4.58 4.58a2.5 2.5 0 0 0 3.54 0L22 10.12a1.5 1.5 0 0 0 0-2.12L19 5z" />
      <path d="M14 8l2-2" />
      <path d="M17 11l2-2" />
      <path d="M7 15l2 2" />
    </svg>
  );
}

export function BallIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Cricket Ball with Seam */}
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14 14 0 0 1 0 20" strokeDasharray="2 2" />
      <path d="M12 2a14 14 0 0 0 0 20" strokeDasharray="2 2" />
      <path d="M5 6l2-2" />
      <path d="M17 18l2 2" />
      <path d="M6 18l-2 2" />
      <path d="M18 6l2-2" />
    </svg>
  );
}

export function AllRounderIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Dual capability: bat and ball / lightning */}
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function KeeperIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Wicketkeeper Glove / Stumps */}
      <path d="M5 4v16" />
      <path d="M12 4v16" />
      <path d="M19 4v16" />
      <path d="M3 4h18" />
    </svg>
  );
}

