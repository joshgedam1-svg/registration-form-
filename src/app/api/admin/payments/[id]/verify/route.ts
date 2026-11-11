import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/payment.service';
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
    const verified = await paymentService.verifyPayment(id, auth.adminId);
    return NextResponse.json({
      success: true,
      data: verified,
      message: 'Payment verified successfully and capacity updated'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: 400 });
  }
}
