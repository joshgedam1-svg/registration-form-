import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/services/payment.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const payments = await paymentService.getPayments({ status, search });
    return NextResponse.json({ success: true, data: payments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch payments' }, { status: 500 });
  }
}
