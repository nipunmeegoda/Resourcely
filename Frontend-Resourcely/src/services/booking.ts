import api from "../api";
import type { Booking, BookingCreateRequest } from "../types/booking";

export const createBooking = async (
  data: BookingCreateRequest
): Promise<Booking> => {
  const response = await api.post<Booking>("/Bookings", data);
  return response.data;
};

export const getBookings = async (userId?: number): Promise<Booking[]> => {
  const params = userId ? { userId } : {};
  const response = await api.get<Booking[]>("/Bookings", { params });
  return response.data;
};

export const getBookingById = async (id: number): Promise<Booking> => {
  const response = await api.get<Booking>(`/Bookings/${id}`);
  return response.data;
};

export const deleteBooking = async (id: number): Promise<void> => {
  await api.delete(`/Bookings/${id}`);
};

export const getAvailableResourceTypes = async (
  userId: number
): Promise<string[]> => {
  const response = await api.get<string[]>(
    `/Bookings/resource-types/${userId}`
  );
  return response.data;
};
