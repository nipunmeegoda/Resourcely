export type RoomStatus = "available" | "reserved" | "maintenance"

export interface Room {
  id: string
  name: string
  capacity: number
  type: "lecture-hall" | "lab"
  status: RoomStatus
  equipment: string[]
  block: string
  building: string
  floor: number
}

export interface Building {
  id: string
  name: string
  floors: number[]
}

export interface TimeSlot {
  id: string
  roomId: string
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
  bookedBy?: string
  purpose?: string
}

export interface BookingRequest {
  roomId: string
  date: string
  startTime: string
  endTime: string
  bookedBy: string
  purpose: string
}

export interface AvailabilityQuery {
  building?: string
  floor?: number
  date?: string
  startTime?: string
  endTime?: string
  capacity?: number
  type?: "lecture-hall" | "lab"
}
