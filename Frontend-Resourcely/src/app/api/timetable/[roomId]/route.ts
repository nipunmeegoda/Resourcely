import { type NextRequest, NextResponse } from "next/server"
import { mockTimeSlots } from "@/lib/mock-data"

// GET /api/timetable/[roomId] - Fetch timetable for specific room
export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    let roomSlots = mockTimeSlots.filter((slot) => slot.roomId === params.roomId)

    // Filter by date if provided
    if (date) {
      roomSlots = roomSlots.filter((slot) => slot.date === date)
    }

    // Only return booked slots
    const bookedSlots = roomSlots.filter((slot) => slot.isBooked)

    return NextResponse.json({
      success: true,
      data: bookedSlots,
      total: bookedSlots.length,
      roomId: params.roomId,
      date: date || "all dates",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch room timetable" }, { status: 500 })
  }
}
