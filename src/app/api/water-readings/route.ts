import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { waterReadings, rooms } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const month = searchParams.get('month');

    // Require either id or month parameter
    if (!id && !month) {
      return NextResponse.json({ 
        error: "Either 'id' or 'month' parameter is required",
        code: "MISSING_PARAMETER"
      }, { status: 400 });
    }

    // Get single reading by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const reading = await db.select()
        .from(waterReadings)
        .where(eq(waterReadings.id, parseInt(id)))
        .limit(1);

      if (reading.length === 0) {
        return NextResponse.json({ 
          error: 'Water reading not found',
          code: "NOT_FOUND"
        }, { status: 404 });
      }

      return NextResponse.json(reading[0], { status: 200 });
    }

    // Get all readings for a specific month
    if (month) {
      // Validate month format (YYYY-MM)
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        return NextResponse.json({ 
          error: "Invalid month format. Use YYYY-MM",
          code: "INVALID_MONTH_FORMAT" 
        }, { status: 400 });
      }

      const readings = await db.select()
        .from(waterReadings)
        .where(eq(waterReadings.month, month));

      return NextResponse.json(readings, { status: 200 });
    }

    return NextResponse.json([], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, month, lastMonth = 0, thisMonth = 0, pricePerUnit = 5.0 } = body;

    // Validate required fields
    if (!roomId) {
      return NextResponse.json({ 
        error: "roomId is required",
        code: "MISSING_ROOM_ID" 
      }, { status: 400 });
    }

    if (!month) {
      return NextResponse.json({ 
        error: "month is required",
        code: "MISSING_MONTH" 
      }, { status: 400 });
    }

    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return NextResponse.json({ 
        error: "Invalid month format. Use YYYY-MM",
        code: "INVALID_MONTH_FORMAT" 
      }, { status: 400 });
    }

    // Validate roomId is an integer
    if (isNaN(parseInt(String(roomId)))) {
      return NextResponse.json({ 
        error: "roomId must be a valid integer",
        code: "INVALID_ROOM_ID" 
      }, { status: 400 });
    }

    // Validate that the room exists
    const roomExists = await db.select()
      .from(rooms)
      .where(eq(rooms.id, parseInt(String(roomId))))
      .limit(1);

    if (roomExists.length === 0) {
      return NextResponse.json({ 
        error: "Room not found",
        code: "ROOM_NOT_FOUND" 
      }, { status: 400 });
    }

    // Calculate usage and total price
    const usage = Number(thisMonth) - Number(lastMonth);
    const totalPrice = usage * Number(pricePerUnit);
    const timestamp = new Date().toISOString();

    // Check if reading exists for this room and month
    const existingReading = await db.select()
      .from(waterReadings)
      .where(
        and(
          eq(waterReadings.roomId, parseInt(String(roomId))),
          eq(waterReadings.month, month)
        )
      )
      .limit(1);

    if (existingReading.length > 0) {
      // Update existing reading
      const updated = await db.update(waterReadings)
        .set({
          lastMonth: Number(lastMonth),
          thisMonth: Number(thisMonth),
          usage,
          pricePerUnit: Number(pricePerUnit),
          totalPrice,
          updatedAt: timestamp
        })
        .where(eq(waterReadings.id, existingReading[0].id))
        .returning();

      return NextResponse.json(updated[0], { status: 201 });
    } else {
      // Create new reading
      const newReading = await db.insert(waterReadings)
        .values({
          roomId: parseInt(String(roomId)),
          month,
          lastMonth: Number(lastMonth),
          thisMonth: Number(thisMonth),
          usage,
          pricePerUnit: Number(pricePerUnit),
          totalPrice,
          createdAt: timestamp,
          updatedAt: timestamp
        })
        .returning();

      return NextResponse.json(newReading[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if reading exists
    const existing = await db.select()
      .from(waterReadings)
      .where(eq(waterReadings.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Water reading not found',
        code: "NOT_FOUND"
      }, { status: 404 });
    }

    const body = await request.json();
    const existingReading = existing[0];

    // Get updated values, defaulting to existing values if not provided
    const lastMonth = body.lastMonth !== undefined ? Number(body.lastMonth) : existingReading.lastMonth;
    const thisMonth = body.thisMonth !== undefined ? Number(body.thisMonth) : existingReading.thisMonth;
    const pricePerUnit = body.pricePerUnit !== undefined ? Number(body.pricePerUnit) : existingReading.pricePerUnit;

    // Recalculate usage and total price
    const usage = thisMonth - lastMonth;
    const totalPrice = usage * pricePerUnit;

    const updated = await db.update(waterReadings)
      .set({
        lastMonth,
        thisMonth,
        usage,
        pricePerUnit,
        totalPrice,
        updatedAt: new Date().toISOString()
      })
      .where(eq(waterReadings.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if reading exists
    const existing = await db.select()
      .from(waterReadings)
      .where(eq(waterReadings.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Water reading not found',
        code: "NOT_FOUND"
      }, { status: 404 });
    }

    const deleted = await db.delete(waterReadings)
      .where(eq(waterReadings.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Water reading deleted successfully',
      deletedReading: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}