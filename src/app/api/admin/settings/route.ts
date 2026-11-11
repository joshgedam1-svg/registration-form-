import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/services/settings.service';

export async function GET(req: NextRequest) {
  try {
    const settings = await settingsService.getAllSettings();
    return NextResponse.json(
      { success: true, data: settings },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await settingsService.updateSettings(body);
    return NextResponse.json({ success: true, data: updated, message: 'Settings saved successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update settings' }, { status: 400 });
  }
}
