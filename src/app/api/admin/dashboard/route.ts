import { NextRequest, NextResponse } from 'next/server';
import { statisticsService } from '@/services/statistics.service';

export async function GET(req: NextRequest) {
  try {
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
    return NextResponse.json({ error: err.message || 'Failed to load dashboard' }, { status: 500 });
  }
}
