import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/payment.service';
import { verifyAdminAuth } from '@/lib/auth/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const payments = await paymentService.getPayments({ status, search });
    return NextResponse.json({ success: true, data: payments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch payments' }, { status: 500 });
  }
}
