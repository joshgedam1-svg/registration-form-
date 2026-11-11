import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const registrationId = (formData.get('registrationId') as string) || 'temp';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. File size check (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File exceeds maximum limit of 5 MB' }, { status: 400 });
    }

    // 2. MIME type check
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() || 'png';
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const storagePath = `payments/${registrationId}/${uniqueFilename}`;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        const buffer = Buffer.from(await file.arrayBuffer());

        const { data, error } = await supabase.storage
          .from('payment-screenshots')
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: false
          });

        if (!error && data) {
          return NextResponse.json({
            success: true,
            filePath: data.path,
            fileName: file.name
          });
        }
      } catch (storageErr) {
        console.error('Supabase storage upload error:', storageErr);
      }
    }

    // Local / data URL preview fallback for testing without configured S3/Supabase storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      filePath: dataUrl,
      fileName: file.name
    });
  } catch (err: any) {
    console.error('Upload API error:', err);
    return NextResponse.json({ error: err.message || 'Failed to upload screenshot' }, { status: 500 });
  }
}
