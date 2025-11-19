export type BookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export type Booking = {
  id: string;
  title: string;
  hallId: string;
  hallName: string;
  organizer: { id: string; name: string; email?: string };
  start: string; // ISO datetime
  end: string; // ISO datetime
  status: BookingStatus;
  attendees?: number;
  equipment?: string[]; // e.g. ['Projector', 'Mic']
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type Hall = {
  id: string;
  name: string;
  capacity: number;
  location?: string;
};

export type BookingFilters = {
  dateRange?: { start: string; end: string };
  hallId?: string;
  status?: BookingStatus;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};
