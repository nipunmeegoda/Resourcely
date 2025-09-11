import { type NextRequest, NextResponse } from "next/server"
import { mockTimeSlots, mockRooms } from "@/lib/mock-data"
import type { BookingRequest } from "@/lib/types"

// Helper function to check if two time ranges overlap
function timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const startTime1 = new Date(`2000-01-01T${start1}`)
  const endTime1 = new Date(`2000-01-01T${end1}`)
  const startTime2 = new Date(`2000-01-01T${start2}`)
  const endTime2 = new Date(`2000-01-01T${end2}`)

  return startTime1 < endTime2 && startTime2 < endTime1
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingRequest = await request.json()

    // Validate required fields
    if (
      !bookingData.roomId ||
      !bookingData.date ||
      !bookingData.startTime ||
      !bookingData.endTime ||
      !bookingData.bookedBy
    ) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Check if room exists
    const room = mockRooms.find((r) => r.id === bookingData.roomId)
    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
    }

    // Check if room is available (not in maintenance or already reserved)
    if (room.status !== "available") {
      return NextResponse.json({ success: false, error: `Room is currently ${room.status}` }, { status: 400 })
    }

    // Check for time conflicts
    const conflictingSlots = mockTimeSlots.filter(
      (slot) =>
        slot.roomId === bookingData.roomId &&
        slot.date === bookingData.date &&
        slot.isBooked &&
        timeRangesOverlap(bookingData.startTime, bookingData.endTime, slot.startTime, slot.endTime),
    )

    if (conflictingSlots.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Time slot conflicts with existing booking",
          conflicts: conflictingSlots,
        },
        { status: 409 },
      )
    }

    // Create new booking (in a real app, this would be saved to database)
    const newBooking = {
      id: `ts${Date.now()}`,
      roomId: bookingData.roomId,
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      isBooked: true,
      bookedBy: bookingData.bookedBy,
      purpose: bookingData.purpose || "Not specified",
    }

    // In a real application, you would save this to your database
    // mockTimeSlots.push(newBooking);

    return NextResponse.json(
      {
        success: true,
        data: newBooking,
        message: `Room ${room.name} booked successfully`,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 })
  }
}

// GET /api/bookings - Fetch all bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const roomId = searchParams.get("roomId")
    const date = searchParams.get("date")
    const bookedBy = searchParams.get("bookedBy")

    let filteredBookings = mockTimeSlots.filter((slot) => slot.isBooked)

    // Apply filters
    if (roomId) {
      filteredBookings = filteredBookings.filter((booking) => booking.roomId === roomId)
    }

    if (date) {
      filteredBookings = filteredBookings.filter((booking) => booking.date === date)
    }

    if (bookedBy) {
      filteredBookings = filteredBookings.filter((booking) =>
        booking.bookedBy?.toLowerCase().includes(bookedBy.toLowerCase()),
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredBookings,
      total: filteredBookings.length,
      filters: { roomId, date, bookedBy },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 })
  }
}
