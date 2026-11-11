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
    const updated = await playerService.approveRegistration(id, auth.adminId);
    return NextResponse.json({ success: true, data: updated, message: 'Registration approved successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to approve registration' }, { status: 400 });
  }
}
