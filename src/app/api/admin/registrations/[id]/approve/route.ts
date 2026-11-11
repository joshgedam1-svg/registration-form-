import { NextRequest, NextResponse } from 'next/server';
import { playerService } from '@/services/player.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = await playerService.approveRegistration(id);
    return NextResponse.json({ success: true, data: updated, message: 'Registration approved successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to approve registration' }, { status: 400 });
  }
}
