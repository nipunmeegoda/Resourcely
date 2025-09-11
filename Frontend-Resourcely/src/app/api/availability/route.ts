import { type NextRequest, NextResponse } from "next/server"
import { mockRooms, mockTimeSlots } from "@/lib/mock-data"
import type { AvailabilityQuery } from "@/lib/types"

// Helper function to check if two time ranges overlap
function timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const startTime1 = new Date(`2000-01-01T${start1}`)
  const endTime1 = new Date(`2000-01-01T${end1}`)
  const startTime2 = new Date(`2000-01-01T${start2}`)
  const endTime2 = new Date(`2000-01-01T${end2}`)

  return startTime1 < endTime2 && startTime2 < endTime1
}

// GET /api/availability - Check room availability with timetable integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query: AvailabilityQuery = {
      building: searchParams.get("building") || undefined,
      floor: searchParams.get("floor") ? Number.parseInt(searchParams.get("floor")!) : undefined,
      date: searchParams.get("date") || undefined,
      startTime: searchParams.get("startTime") || undefined,
      endTime: searchParams.get("endTime") || undefined,
      capacity: searchParams.get("capacity") ? Number.parseInt(searchParams.get("capacity")!) : undefined,
      type: (searchParams.get("type") as "lecture-hall" | "lab") || undefined,
    }

    let availableRooms = mockRooms.filter((room) => room.status === "available")

    // Apply basic filters
    if (query.building) {
      availableRooms = availableRooms.filter((room) => room.building === query.building)
    }

    if (query.floor !== undefined) {
      availableRooms = availableRooms.filter((room) => room.floor === query.floor)
    }

    if (query.type) {
      availableRooms = availableRooms.filter((room) => room.type === query.type)
    }

    if (query.capacity !== undefined) {
      availableRooms = availableRooms.filter((room) => room.capacity >= query.capacity!)
    }

    // Check timetable conflicts if date and time are provided
    if (query.date && query.startTime && query.endTime) {
      availableRooms = availableRooms.filter((room) => {
        const conflictingSlots = mockTimeSlots.filter(
          (slot) =>
            slot.roomId === room.id &&
            slot.date === query.date &&
            slot.isBooked &&
            timeRangesOverlap(query.startTime!, query.endTime!, slot.startTime, slot.endTime),
        )

        return conflictingSlots.length === 0
      })
    }

    // Add availability status for each room
    const roomsWithAvailability = availableRooms.map((room) => {
      const bookedSlots = mockTimeSlots.filter(
        (slot) => slot.roomId === room.id && slot.date === query.date && slot.isBooked,
      )

      return {
        ...room,
        bookedSlots: query.date ? bookedSlots : [],
        isAvailableForRequestedTime:
          query.date && query.startTime && query.endTime
            ? !bookedSlots.some((slot) =>
                timeRangesOverlap(query.startTime!, query.endTime!, slot.startTime, slot.endTime),
              )
            : true,
      }
    })

    return NextResponse.json({
      success: true,
      data: roomsWithAvailability,
      total: roomsWithAvailability.length,
      query,
      message: `Found ${roomsWithAvailability.length} available rooms`,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to check availability" }, { status: 500 })
  }
}
