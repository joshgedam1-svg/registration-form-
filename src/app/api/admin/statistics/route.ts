import { NextRequest, NextResponse } from 'next/server';
import { statisticsService } from '@/services/statistics.service';
import { verifyAdminAuth } from '@/lib/auth/adminAuth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const stats = await statisticsService.getDashboardStatistics();
    return NextResponse.json(
      { success: true, data: stats },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch statistics' }, { status: 500 });
  }
}
