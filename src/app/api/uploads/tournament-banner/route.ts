import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No banner image uploaded' }, { status: 400 });
    }

    // Max 10MB for high-res banners
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Banner image exceeds maximum limit of 10 MB' }, { status: 400 });
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file format. Only JPG, PNG, and WebP are allowed' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'png';
    const uniqueFilename = `tournament-banner-${Date.now()}.${ext}`;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to payment-screenshots bucket or public bucket
        const { data, error } = await supabase.storage
          .from('payment-screenshots')
          .upload(`banners/${uniqueFilename}`, buffer, {
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
        console.error('Supabase banner upload error:', storageErr);
      }
    }

    // Local / Dev Fallback: Data URL
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      filePath: dataUrl,
      fileName: file.name
    });
  } catch (err: any) {
    console.error('Banner upload route error:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload banner' }, { status: 500 });
  }
}

