import { NextRequest, NextResponse } from 'next/server';
import { playerService } from '@/services/player.service';
import { verifyAdminAuth } from '@/lib/auth/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const role = searchParams.get('role') || undefined;
    const search = searchParams.get('search') || undefined;

    const players = await playerService.getPlayers({ status, role, search });
    return NextResponse.json({ success: true, data: players });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch players' }, { status: 500 });
  }
}
