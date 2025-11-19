import { Booking, Hall, BookingFilters, BookingStatus } from "@/types/booking";

// Backend API response types
interface BackendBooking {
  id: number;
  userId: number;
  resourceId: number;
  resourceName: string;
  resourceLocation: string;
  bookingAt: string;
  endAt: string;
  reason: string;
  capacity: number;
  contact: string;
  createdAt: string;
  status: string;
  rejectionReason?: string;
}

// Mock data for development
const mockBookings: Booking[] = [
  {
    id: "1",
    title: "Advanced Web Development Lecture",
    hallId: "h1",
    hallName: "Main Auditorium",
    organizer: {
      id: "u1",
      name: "Dr. Sarah Johnson",
      email: "sarah.j@university.edu",
    },
    start: "2025-11-19T09:00:00",
    end: "2025-11-19T11:00:00",
    status: "Approved",
    attendees: 150,
    equipment: ["Projector", "Microphone", "Whiteboard"],
    notes: "Please ensure projector is tested before class",
    createdAt: "2025-11-10T08:00:00",
  },
  {
    id: "2",
    title: "Data Structures Lab Session",
    hallId: "h2",
    hallName: "Computer Lab 1",
    organizer: {
      id: "u2",
      name: "Prof. Michael Chen",
      email: "michael.c@university.edu",
    },
    start: "2025-11-19T14:00:00",
    end: "2025-11-19T16:00:00",
    status: "Approved",
    attendees: 40,
    equipment: ["Computers", "Projector"],
    createdAt: "2025-11-12T10:00:00",
  },
  {
    id: "3",
    title: "Machine Learning Seminar",
    hallId: "h3",
    hallName: "Seminar Room A",
    organizer: {
      id: "u3",
      name: "Dr. Emily Rodriguez",
      email: "emily.r@university.edu",
    },
    start: "2025-11-20T10:00:00",
    end: "2025-11-20T12:00:00",
    status: "Pending",
    attendees: 60,
    equipment: ["Projector", "Sound System"],
    notes: "Guest speaker from industry",
    createdAt: "2025-11-15T14:30:00",
  },
  {
    id: "4",
    title: "Database Systems Workshop",
    hallId: "h1",
    hallName: "Main Auditorium",
    organizer: {
      id: "u4",
      name: "Prof. James Wilson",
      email: "james.w@university.edu",
    },
    start: "2025-11-21T13:00:00",
    end: "2025-11-21T15:00:00",
    status: "Approved",
    attendees: 120,
    equipment: ["Projector", "Microphone"],
    createdAt: "2025-11-13T09:00:00",
  },
  {
    id: "5",
    title: "Student Project Presentations",
    hallId: "h4",
    hallName: "Conference Hall",
    organizer: {
      id: "u5",
      name: "Dr. Anna Martinez",
      email: "anna.m@university.edu",
    },
    start: "2025-11-22T09:00:00",
    end: "2025-11-22T17:00:00",
    status: "Approved",
    attendees: 80,
    equipment: ["Projector", "Microphone", "Cameras"],
    notes: "All-day event with multiple presentations",
    createdAt: "2025-11-11T16:00:00",
  },
];

const mockHalls: Hall[] = [
  {
    id: "h1",
    name: "Main Auditorium",
    capacity: 200,
    location: "Building A, Floor 1",
  },
  {
    id: "h2",
    name: "Computer Lab 1",
    capacity: 50,
    location: "Building B, Floor 2",
  },
  {
    id: "h3",
    name: "Seminar Room A",
    capacity: 80,
    location: "Building A, Floor 2",
  },
  {
    id: "h4",
    name: "Conference Hall",
    capacity: 100,
    location: "Building C, Floor 1",
  },
];

interface FetchOptions {
  useMock?: boolean;
}

export async function fetchBookings(
  filters?: BookingFilters,
  options?: FetchOptions
): Promise<Booking[]> {
  if (options?.useMock ?? false) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockBookings;
  }

  // Real API call to backend
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5210";
  const response = await fetch(`${apiUrl}/api/bookings/my-bookings`);
  if (!response.ok) throw new Error("Failed to fetch bookings");

  const backendBookings: BackendBooking[] = await response.json();

  // Transform backend data to frontend format
  return backendBookings.map((b) => ({
    id: b.id.toString(),
    title: b.reason,
    hallId: b.resourceId.toString(),
    hallName: b.resourceName,
    organizer: {
      id: b.userId.toString(),
      name: `User ${b.userId}`,
      email: b.contact,
    },
    start: b.bookingAt,
    end: b.endAt,
    status: b.status as BookingStatus,
    attendees: b.capacity,
    equipment: [],
    notes: b.resourceLocation,
    createdAt: b.createdAt,
  }));
}

export async function fetchHalls(options?: FetchOptions): Promise<Hall[]> {
  if (options?.useMock ?? false) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockHalls;
  }

  // Real API call to backend - fetch all resources
  try {
    // For simplicity, we'll just return mock halls for now
    // You could expand this to fetch actual resources from the backend if needed
    // Example: const buildingsRes = await fetch(`${apiUrl}/api/buildings`);
    return mockHalls;
  } catch (error) {
    console.error("Error fetching halls:", error);
    return mockHalls;
  }
}
