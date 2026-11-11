'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  upiId: string;
  amount: number;
  tournamentName?: string;
  customQrPath?: string | null;
  className?: string;
}

export default function QRCodeDisplay({
  upiId,
  amount,
  tournamentName = 'Cricket Auction League',
  customQrPath,
  className
}: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    // If a custom QR image was uploaded by the admin, use it directly
    if (customQrPath) {
      return;
    }

    // Otherwise, generate standard NPCI UPI QR code
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      tournamentName
    )}&am=${amount}&cu=INR&tn=${encodeURIComponent('Player Registration Fee')}`;

    QRCode.toDataURL(upiUri, {
      width: 280,
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
  }, [upiId, amount, tournamentName, customQrPath]);

  const imageSrc = customQrPath || qrDataUrl;

  return (
    <div className={className || "relative w-36 h-36 bg-white border border-brand-border rounded-xl p-2 shadow-sm flex items-center justify-center shrink-0 overflow-hidden"}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={`UPI QR Code for ${upiId}`}
          className="w-full h-full object-contain rounded-lg"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-[11px] text-brand-muted text-center p-2">
          Generating QR...
        </div>
      )}
      <div className="absolute inset-0 bg-primary-green/5 rounded-xl pointer-events-none" />
    </div>
  );
}
