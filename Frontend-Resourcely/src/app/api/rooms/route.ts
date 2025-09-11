import { type NextRequest, NextResponse } from "next/server"
import { mockRooms } from "@/lib/mock-data"
import type { AvailabilityQuery } from "@/lib/types"

// GET /api/rooms - Fetch all rooms with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query: AvailabilityQuery = {
      building: searchParams.get("building") || undefined,
      floor: searchParams.get("floor") ? Number.parseInt(searchParams.get("floor")!) : undefined,
      type: (searchParams.get("type") as "lecture-hall" | "lab") || undefined,
      capacity: searchParams.get("capacity") ? Number.parseInt(searchParams.get("capacity")!) : undefined,
    }

    let filteredRooms = mockRooms

    // Apply filters
    if (query.building) {
      filteredRooms = filteredRooms.filter((room) => room.building === query.building)
    }

    if (query.floor !== undefined) {
      filteredRooms = filteredRooms.filter((room) => room.floor === query.floor)
    }

    if (query.type) {
      filteredRooms = filteredRooms.filter((room) => room.type === query.type)
    }

    if (query.capacity !== undefined) {
      filteredRooms = filteredRooms.filter((room) => room.capacity >= query.capacity!)
    }

    return NextResponse.json({
      success: true,
      data: filteredRooms,
      total: filteredRooms.length,
      filters: query,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch rooms" }, { status: 500 })
  }
}
