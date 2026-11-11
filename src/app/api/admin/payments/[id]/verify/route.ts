import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/payment.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const verified = await paymentService.verifyPayment(id);
    return NextResponse.json({
      success: true,
      data: verified,
      message: 'Payment verified successfully and capacity updated'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Payment verification failed' }, { status: 400 });
  }
}
