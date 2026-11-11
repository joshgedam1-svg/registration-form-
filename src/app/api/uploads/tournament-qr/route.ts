import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No QR code image uploaded' }, { status: 400 });
    }

    // Max 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Image exceeds maximum limit of 5 MB' }, { status: 400 });
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file format. Only JPG, PNG, and WebP are allowed' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'png';
    const uniqueFilename = `tournament-qr-${Date.now()}.${ext}`;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        const buffer = Buffer.from(await file.arrayBuffer());

        const { data, error } = await supabase.storage
          .from('payment-screenshots')
          .upload(`qr/${uniqueFilename}`, buffer, {
            contentType: file.type,
            upsert: true
          });

        if (!error && data) {
          const { data: pubData } = supabase.storage.from('payment-screenshots').getPublicUrl(data.path);
          return NextResponse.json({
            success: true,
            filePath: pubData.publicUrl,
            fileName: file.name
          });
        }
      } catch (storageErr) {
        console.error('Supabase QR upload error:', storageErr);
      }
    }

    // Dev/Local fallback: Data URL
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      filePath: dataUrl,
      fileName: file.name
    });
  } catch (err: any) {
    console.error('QR upload route error:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload QR code' }, { status: 500 });
  }
}

