import { NextResponse } from "next/server"
import { buildings } from "@/lib/mock-data"

// GET /api/buildings - Fetch all buildings
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: buildings,
      total: buildings.length,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch buildings" }, { status: 500 })
  }
}
