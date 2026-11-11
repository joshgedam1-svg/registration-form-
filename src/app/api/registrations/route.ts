import { NextRequest, NextResponse } from 'next/server';
import { registrationService } from '@/services/registration.service';
import { registrationSchema } from '@/lib/validations/registration';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const parseResult = registrationSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const result = await registrationService.submitRegistration(parseResult.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Registration submitted successfully',
        data: result
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Registration submission API error:', err);
    return NextResponse.json(
      {
        error: err.message || 'An unexpected error occurred while processing registration'
      },
      { status: 400 }
    );
  }
}

