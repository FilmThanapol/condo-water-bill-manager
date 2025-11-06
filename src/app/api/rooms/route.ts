import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { rooms } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single room by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const room = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, parseInt(id)))
        .limit(1);

      if (room.length === 0) {
        return NextResponse.json(
          { error: 'Room not found', code: 'ROOM_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(room[0], { status: 200 });
    }

    // List rooms with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(rooms);

    if (search) {
      query = query.where(
        or(
          like(rooms.roomNumber, `%${search}%`),
          like(rooms.ownerName, `%${search}%`)
        )
      );
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { roomNumber, ownerName } = body;

    // Validate required fields
    if (!roomNumber || !ownerName) {
      return NextResponse.json(
        {
          error: 'roomNumber and ownerName are required',
          code: 'MISSING_REQUIRED_FIELDS',
        },
        { status: 400 }
      );
    }

    // Validate field types
    if (typeof roomNumber !== 'string' || typeof ownerName !== 'string') {
      return NextResponse.json(
        {
          error: 'roomNumber and ownerName must be strings',
          code: 'INVALID_FIELD_TYPE',
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedRoomNumber = roomNumber.trim();
    const sanitizedOwnerName = ownerName.trim();

    if (!sanitizedRoomNumber || !sanitizedOwnerName) {
      return NextResponse.json(
        {
          error: 'roomNumber and ownerName cannot be empty',
          code: 'EMPTY_REQUIRED_FIELDS',
        },
        { status: 400 }
      );
    }

    // Check for duplicate roomNumber
    const existingRoom = await db
      .select()
      .from(rooms)
      .where(eq(rooms.roomNumber, sanitizedRoomNumber))
      .limit(1);

    if (existingRoom.length > 0) {
      return NextResponse.json(
        {
          error: 'Room number already exists',
          code: 'DUPLICATE_ROOM_NUMBER',
        },
        { status: 400 }
      );
    }

    // Create new room
    const newRoom = await db
      .insert(rooms)
      .values({
        roomNumber: sanitizedRoomNumber,
        ownerName: sanitizedOwnerName,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newRoom[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const roomId = parseInt(id);

    // Check if room exists
    const existingRoom = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (existingRoom.length === 0) {
      return NextResponse.json(
        { error: 'Room not found', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { roomNumber, ownerName } = body;

    // Validate at least one field is provided
    if (!roomNumber && !ownerName) {
      return NextResponse.json(
        {
          error: 'At least one field (roomNumber or ownerName) must be provided',
          code: 'NO_UPDATE_FIELDS',
        },
        { status: 400 }
      );
    }

    // Prepare update object
    const updates: { roomNumber?: string; ownerName?: string } = {};

    if (roomNumber !== undefined) {
      if (typeof roomNumber !== 'string') {
        return NextResponse.json(
          { error: 'roomNumber must be a string', code: 'INVALID_FIELD_TYPE' },
          { status: 400 }
        );
      }

      const sanitizedRoomNumber = roomNumber.trim();
      if (!sanitizedRoomNumber) {
        return NextResponse.json(
          { error: 'roomNumber cannot be empty', code: 'EMPTY_ROOM_NUMBER' },
          { status: 400 }
        );
      }

      // Check for duplicate roomNumber (if it's being changed)
      if (sanitizedRoomNumber !== existingRoom[0].roomNumber) {
        const duplicateRoom = await db
          .select()
          .from(rooms)
          .where(eq(rooms.roomNumber, sanitizedRoomNumber))
          .limit(1);

        if (duplicateRoom.length > 0) {
          return NextResponse.json(
            {
              error: 'Room number already exists',
              code: 'DUPLICATE_ROOM_NUMBER',
            },
            { status: 400 }
          );
        }
      }

      updates.roomNumber = sanitizedRoomNumber;
    }

    if (ownerName !== undefined) {
      if (typeof ownerName !== 'string') {
        return NextResponse.json(
          { error: 'ownerName must be a string', code: 'INVALID_FIELD_TYPE' },
          { status: 400 }
        );
      }

      const sanitizedOwnerName = ownerName.trim();
      if (!sanitizedOwnerName) {
        return NextResponse.json(
          { error: 'ownerName cannot be empty', code: 'EMPTY_OWNER_NAME' },
          { status: 400 }
        );
      }

      updates.ownerName = sanitizedOwnerName;
    }

    // Update room
    const updatedRoom = await db
      .update(rooms)
      .set(updates)
      .where(eq(rooms.id, roomId))
      .returning();

    return NextResponse.json(updatedRoom[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const roomId = parseInt(id);

    // Check if room exists
    const existingRoom = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, roomId))
      .limit(1);

    if (existingRoom.length === 0) {
      return NextResponse.json(
        { error: 'Room not found', code: 'ROOM_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete room
    const deletedRoom = await db
      .delete(rooms)
      .where(eq(rooms.id, roomId))
      .returning();

    return NextResponse.json(
      {
        message: 'Room deleted successfully',
        room: deletedRoom[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
