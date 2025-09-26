export interface Booking {
  id: number;
  userId: string;
  location: string;
  resourceType: string;
  bookingAt: string;
  reason: string;
  capacity: number;
  contact: string;
  createdAt: string;
}

export interface BookingCreateRequest {
  location: string;
  resourceType: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:mm format
  reason: string;
  capacity: number;
  contact: string;
  userId?: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}
