import { NextRequest, NextResponse } from 'next/server';
import { playerService } from '@/services/player.service';
import { verifyAdminAuth } from '@/lib/auth/adminAuth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const player = await playerService.getPlayerById(id);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: player });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await playerService.updatePlayer(id, body, auth.adminId);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update player' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await playerService.deletePlayer(id, auth.adminId);
    return NextResponse.json({ success: true, message: 'Player deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete player' }, { status: 500 });
  }
}
