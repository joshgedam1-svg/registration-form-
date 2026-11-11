import { NextRequest, NextResponse } from 'next/server';
import { playerService } from '@/services/player.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const reason = body?.reason;

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'A rejection reason is required' }, { status: 400 });
    }

    const updated = await playerService.rejectRegistration(id, reason);
    return NextResponse.json({ success: true, data: updated, message: 'Registration rejected' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to reject registration' }, { status: 400 });
  }
}
