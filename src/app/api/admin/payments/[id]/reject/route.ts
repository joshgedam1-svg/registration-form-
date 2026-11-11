import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/payment.service';

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

    const rejected = await paymentService.rejectPayment(id, reason);
    return NextResponse.json({
      success: true,
      data: rejected,
      message: 'Payment rejected'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Payment rejection failed' }, { status: 400 });
  }
}
