import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
    }

    // Max 3MB
    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Image exceeds maximum limit of 3 MB' }, { status: 400 });
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file format. Only JPG, PNG, and WebP are allowed' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const uniqueFilename = `player-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();
        const buffer = Buffer.from(await file.arrayBuffer());

        const { data, error } = await supabase.storage
          .from('player-photos')
          .upload(uniqueFilename, buffer, {
            contentType: file.type,
            upsert: false
          });

        if (!error && data) {
          const { data: pubData } = supabase.storage.from('player-photos').getPublicUrl(data.path);
          return NextResponse.json({
            success: true,
            filePath: pubData.publicUrl,
            fileName: file.name
          });
        }
      } catch (storageErr) {
        console.error('Supabase player-photo upload error:', storageErr);
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      filePath: dataUrl,
      fileName: file.name
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to upload photo' }, { status: 500 });
  }
}

