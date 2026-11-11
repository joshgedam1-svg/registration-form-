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

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.full_name || !body.mobile) {
      return NextResponse.json({ error: 'Player name and mobile are required' }, { status: 400 });
    }

    const created = await playerService.createPlayer(body, auth.adminId);
    return NextResponse.json({ success: true, data: created, message: 'Player created successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create player' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (body.all) {
      const count = await playerService.deleteAllPlayers(auth.adminId);
      return NextResponse.json({ success: true, count, message: 'All players deleted successfully' });
    }

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json({ error: 'No player IDs provided for deletion' }, { status: 400 });
    }

    const count = await playerService.deletePlayers(body.ids, auth.adminId);
    return NextResponse.json({ success: true, count, message: `${count} players deleted successfully` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete players' }, { status: 500 });
  }
}
