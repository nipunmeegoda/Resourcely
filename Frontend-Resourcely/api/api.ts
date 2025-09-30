import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 5000,
});

// Types for the hierarchical structure
export interface Building {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface Floor {
  id: number;
  name: string;
  description: string;
  buildingId: number;
  buildingName: string;
}

export interface Block {
  id: number;
  name: string;
  description: string;
  floorId: number;
  floorName: string;
  buildingName: string;
}

export interface Resource {
  id: number;
  name: string;
  type: string;
  description: string;
  capacity: number;
  blockId: number;
  blockName: string;
  floorName: string;
  buildingName: string;
  fullPath?: string;
}

export interface Booking {
  id: number;
  userId: string;
  resourceId: number;
  resourceName: string;
  resourceLocation: string;
  bookingAt: string;
  endAt: string;
  reason: string;
  capacity: number;
  contact: string;
  createdAt: string;
}

export interface BookingRequest {
  resourceId: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  endTime: string; // "HH:mm"
  reason: string;
  capacity: number;
  contact: string;
  userId?: number;
}

// API functions
export const buildingsApi = {
  getAll: () => api.get<Building[]>("/api/buildings"),
  getById: (id: number) => api.get(`/api/buildings/${id}`),
};

export const floorsApi = {
  getByBuilding: (buildingId: number) =>
    api.get<Floor[]>(`/api/floors/by-building/${buildingId}`),
  getById: (id: number) => api.get(`/api/floors/${id}`),
};

export const blocksApi = {
  getByFloor: (floorId: number) =>
    api.get<Block[]>(`/api/blocks/by-floor/${floorId}`),
  getById: (id: number) => api.get(`/api/blocks/${id}`),
};

export const resourcesApi = {
  getByBlock: (blockId: number) =>
    api.get<Resource[]>(`/api/resources/by-block/${blockId}`),
  getById: (id: number) => api.get(`/api/resources/${id}`),
  getAvailability: (id: number, date: string) =>
    api.get(`/api/resources/${id}/availability?date=${date}`),
};

export const bookingsApi = {
  create: (booking: BookingRequest) =>
    api.post<Booking>("/api/bookings", booking),
  getById: (id: number) => api.get<Booking>(`/api/bookings/${id}`),
  getByResource: (resourceId: number, date?: string) => {
    const params = date ? `?date=${date}` : "";
    return api.get<Booking[]>(
      `/api/bookings/by-resource/${resourceId}${params}`
    );
  },
  delete: (id: number) => api.delete(`/api/bookings/${id}`),
};

// Admin API functions
export const adminApi = {
  getOverview: () => api.get("/api/admin/overview"),
  createBuilding: (data: { name: string; description?: string }) =>
    api.post("/api/admin/buildings", data),
  createFloor: (data: {
    name: string;
    description?: string;
    buildingId: number;
  }) => api.post("/api/admin/floors", data),
  createBlock: (data: {
    name: string;
    description?: string;
    floorId: number;
  }) => api.post("/api/admin/blocks", data),
  createResource: (data: {
    name: string;
    type: string;
    description?: string;
    capacity: number;
    blockId: number;
  }) => api.post("/api/admin/resources", data),
  toggleResource: (id: number) => api.put(`/api/admin/resources/${id}/toggle`),
};

export default api;
