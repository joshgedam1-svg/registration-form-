import { NextRequest, NextResponse } from 'next/server';
import { playerService } from '@/services/player.service';

export async function GET(req: NextRequest) {
  try {
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
