import { type NextRequest, NextResponse } from "next/server"
import { mockTimeSlots } from "@/lib/mock-data"

// GET /api/timetable - Fetch timetable data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const roomId = searchParams.get("roomId")
    const date = searchParams.get("date")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let filteredSlots = mockTimeSlots

    // Filter by room ID
    if (roomId) {
      filteredSlots = filteredSlots.filter((slot) => slot.roomId === roomId)
    }

    // Filter by specific date
    if (date) {
      filteredSlots = filteredSlots.filter((slot) => slot.date === date)
    }

    // Filter by date range
    if (startDate && endDate) {
      filteredSlots = filteredSlots.filter((slot) => slot.date >= startDate && slot.date <= endDate)
    }

    // Only return booked slots
    const bookedSlots = filteredSlots.filter((slot) => slot.isBooked)

    return NextResponse.json({
      success: true,
      data: bookedSlots,
      total: bookedSlots.length,
      filters: {
        roomId,
        date,
        startDate,
        endDate,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch timetable" }, { status: 500 })
  }
}
