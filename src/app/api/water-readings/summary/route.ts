import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { waterReadings, rooms } from '@/db/schema';
import { eq, sql, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    // Validate month parameter
    if (!month) {
      return NextResponse.json({ 
        error: 'Month parameter is required',
        code: 'MISSING_MONTH'
      }, { status: 400 });
    }

    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return NextResponse.json({ 
        error: 'Invalid month format. Expected YYYY-MM',
        code: 'INVALID_MONTH_FORMAT'
      }, { status: 400 });
    }

    // Get all readings for the specified month
    const readings = await db
      .select({
        id: waterReadings.id,
        roomId: waterReadings.roomId,
        usage: waterReadings.usage,
        totalPrice: waterReadings.totalPrice,
        roomNumber: rooms.roomNumber,
        ownerName: rooms.ownerName,
      })
      .from(waterReadings)
      .innerJoin(rooms, eq(waterReadings.roomId, rooms.id))
      .where(eq(waterReadings.month, month));

    // Check if any readings exist for this month
    if (readings.length === 0) {
      return NextResponse.json({ 
        error: 'No readings found for the specified month',
        code: 'NO_READINGS_FOUND'
      }, { status: 404 });
    }

    // Calculate statistics
    const totalRooms = new Set(readings.map(r => r.roomId)).size;
    const readingsCount = readings.length;
    
    const totalUsage = readings.reduce((sum, r) => sum + r.usage, 0);
    const totalRevenue = readings.reduce((sum, r) => sum + r.totalPrice, 0);
    
    const averageUsage = totalUsage / totalRooms;
    const averagePrice = totalRevenue / totalRooms;

    // Find max usage
    const maxReading = readings.reduce((max, current) => 
      current.usage > max.usage ? current : max
    );

    const maxUsage = {
      usage: maxReading.usage,
      roomId: maxReading.roomId,
      roomNumber: maxReading.roomNumber,
      ownerName: maxReading.ownerName,
    };

    // Find min usage
    const minReading = readings.reduce((min, current) => 
      current.usage < min.usage ? current : min
    );

    const minUsage = {
      usage: minReading.usage,
      roomId: minReading.roomId,
      roomNumber: minReading.roomNumber,
      ownerName: minReading.ownerName,
    };

    // Return summary statistics
    return NextResponse.json({
      month,
      totalRooms,
      totalUsage: Math.round(totalUsage * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageUsage: Math.round(averageUsage * 100) / 100,
      averagePrice: Math.round(averagePrice * 100) / 100,
      maxUsage,
      minUsage,
      readingsCount,
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}