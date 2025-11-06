import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { waterReadings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Get query parameters from URL
    const url = new URL(request.url);
    const fromMonth = url.searchParams.get('fromMonth');
    const toMonth = url.searchParams.get('toMonth');

    // Validate required parameters
    if (!fromMonth || !toMonth) {
      return NextResponse.json(
        {
          error: 'Both fromMonth and toMonth parameters are required',
          code: 'MISSING_PARAMETERS',
        },
        { status: 400 }
      );
    }

    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!monthRegex.test(fromMonth)) {
      return NextResponse.json(
        {
          error: 'fromMonth must be in YYYY-MM format',
          code: 'INVALID_FROM_MONTH_FORMAT',
        },
        { status: 400 }
      );
    }

    if (!monthRegex.test(toMonth)) {
      return NextResponse.json(
        {
          error: 'toMonth must be in YYYY-MM format',
          code: 'INVALID_TO_MONTH_FORMAT',
        },
        { status: 400 }
      );
    }

    // Get all readings for fromMonth
    const sourceReadings = await db
      .select()
      .from(waterReadings)
      .where(eq(waterReadings.month, fromMonth));

    // Check if readings exist for fromMonth
    if (sourceReadings.length === 0) {
      return NextResponse.json(
        {
          error: `No readings found for month ${fromMonth}`,
          code: 'NO_READINGS_FOUND',
        },
        { status: 404 }
      );
    }

    const currentTimestamp = new Date().toISOString();
    let rolledOverCount = 0;

    // Process each reading
    for (const sourceReading of sourceReadings) {
      // Check if reading already exists for this room and toMonth
      const existingReading = await db
        .select()
        .from(waterReadings)
        .where(
          and(
            eq(waterReadings.roomId, sourceReading.roomId),
            eq(waterReadings.month, toMonth)
          )
        )
        .limit(1);

      const newReadingData = {
        roomId: sourceReading.roomId,
        month: toMonth,
        lastMonth: sourceReading.thisMonth,
        thisMonth: 0,
        usage: 0,
        pricePerUnit: sourceReading.pricePerUnit,
        totalPrice: 0,
        updatedAt: currentTimestamp,
      };

      if (existingReading.length > 0) {
        // Update existing reading
        await db
          .update(waterReadings)
          .set(newReadingData)
          .where(eq(waterReadings.id, existingReading[0].id));
      } else {
        // Insert new reading
        await db.insert(waterReadings).values({
          ...newReadingData,
          createdAt: currentTimestamp,
        });
      }

      rolledOverCount++;
    }

    return NextResponse.json(
      {
        message: 'Water readings rolled over successfully',
        fromMonth,
        toMonth,
        count: rolledOverCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}