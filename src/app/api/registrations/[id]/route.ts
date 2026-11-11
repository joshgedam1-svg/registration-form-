import { NextRequest, NextResponse } from 'next/server';
import { registrationService } from '@/services/registration.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    const registration = await registrationService.getRegistrationById(id);
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: registration });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

