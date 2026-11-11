import { NextRequest, NextResponse } from 'next/server';
import { playerService } from '@/services/player.service';
import { verifyAdminAuth } from '@/lib/auth/adminAuth';

export async function POST(
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
    const reason = body?.reason;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'A rejection reason is required' }, { status: 400 });
    }

    const updated = await playerService.rejectRegistration(id, reason, auth.adminId);
    return NextResponse.json({ success: true, data: updated, message: 'Registration rejected' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to reject registration' }, { status: 400 });
  }
}
