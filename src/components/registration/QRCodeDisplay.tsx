'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  upiId: string;
  amount: number;
  tournamentName?: string;
}

export default function QRCodeDisplay({ upiId, amount, tournamentName = 'Cricket Auction League' }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // Standard NPCI UPI URI Scheme
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      tournamentName
    )}&am=${amount}&cu=INR&tn=${encodeURIComponent('Player Registration Fee')}`;

    QRCode.toDataURL(upiUri, {
      width: 250,
      margin: 2,
      color: {
        dark: '#176B45',
        light: '#FFFFFF'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => {
        console.error('Failed to generate UPI QR code:', err);
      });
  }, [upiId, amount, tournamentName]);

  return (
    <div className="relative w-36 h-36 bg-white border border-brand-border rounded-xl p-2 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
      {qrDataUrl ? (
        <img
          src={qrDataUrl}
          alt={`UPI QR Code for ${upiId}`}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-brand-muted">
          Generating QR...
        </div>
      )}
      <div className="absolute inset-0 bg-primary-green/5 rounded-xl pointer-events-none" />
    </div>
  );
}

