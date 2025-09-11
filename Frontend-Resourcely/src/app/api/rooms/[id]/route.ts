import { type NextRequest, NextResponse } from "next/server"
import { mockRooms } from "@/lib/mock-data"

// GET /api/rooms/[id] - Fetch specific room by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const room = mockRooms.find((r) => r.id === params.id)

    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: room,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch room" }, { status: 500 })
  }
}
