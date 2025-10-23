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
  updatedAt?: string;
  status?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
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
  // Backwards-compatible alias used by some components
  remove: (id: number) => api.delete(`/api/bookings/${id}`),
  getUserBookings: (userId?: string) => {
    const params = userId ? `?userId=${userId}` : "";
    return api.get<Booking[]>(`/api/bookings/my-bookings${params}`);
  },
};

// User API functions
export const userApi = {
  getStats: () => api.get("/api/user/stats"),
  getRecentBookings: () => api.get<Booking[]>("/api/user/bookings/recent"),
};

export const usersApi = {
  getAll: () => api.get("/api/user"), // returns all users except Admin
  getAllRoleUser: () => api.get("/api/user/role/user"),
  getAllRoleStudent:() => api.get("/api/user/students"),
  getAllRoleLecturer:() => api.get("/api/user/lecturers"),
  updateRole: (id: number, role: string) =>
      api.put(`/api/user/${id}/role`, { role }),
  deleteUser: (id: number) => api.delete(`/api/user/${id}`),

  assignBatch: (id: number, batchId: number) =>
      api.put(`/api/user/${id}/batch`, { batchId }), // body: { "batchId": <number> }

  removeBatch: (id: number) =>
      api.delete(`/api/user/${id}/batch`),

  assignDepartment: (id: number, departmentId: number) =>
      api.put(`/api/user/${id}/department`, { departmentId }),

  removeDepartment: (id: number) =>
      api.delete(`/api/user/${id}/department`),
};

export const departmentApi = {
    getAll: () => api.get("/api/department"),
    create: (payload: { name: string; description?: string }) =>
      api.post("/api/department", payload),
};

// api/batchApi.ts (or inside your central API exports)
export const batchApi = {
  // --- Batches ---
  getAll: () => api.get("/api/batches"),
  getById: (batchId: number) => api.get(`/api/batches/${batchId}`),
  create: (payload: {
    name: string;
    code: string;
    startDate?: string | null;
    endDate?: string | null;
  }) => api.post("/api/batches", payload),
  update: (
      batchId: number,
      payload: Partial<{
        name: string;
        code: string;
        startDate: string | null;
        endDate: string | null;
        isActive: boolean;
      }>
  ) => api.put(`/api/batches/${batchId}`, payload),
  remove: (batchId: number) => api.delete(`/api/batches/${batchId}`),

  // --- Students in a batch ---
  getStudents: (batchId: number) =>
      api.get(`/api/batches/${batchId}/students`),

  // --- Bulk-assign students to a batch ---
  bulkAssignStudents: (batchId: number, userIds: number[]) =>
      api.post(`/api/batches/${batchId}/students`, { userIds }),

  // ---- Backward-compatible aliases to match your requested shape ----
  getAllBatches: () => api.get("/api/batches"),
  getBatchById: (BatchId: number) =>
      api.get(`/api/batches/${BatchId}/students`),
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

  // Booking management
  getPendingBookings: () => api.get<Booking[]>("/api/admin/bookings/pending"),
  getApprovedBookings: () => api.get<Booking[]>("/api/admin/bookings/approved"),
  getRejectedBookings: () => api.get<Booking[]>("/api/admin/bookings/rejected"),
  approveBooking: (id: number) => api.put(`/api/admin/bookings/${id}/approve`),
  rejectBooking: (id: number, reason: string) =>
    api.put(`/api/admin/bookings/${id}/reject`, { reason }),
  updateBooking: (
    id: number,
    payload: {
      date: string; // yyyy-MM-dd
      time: string; // HH:mm
      endTime: string; // HH:mm
      reason: string;
      capacity: number;
      contact: string;
    }
  ) => api.put(`/api/admin/bookings/${id}`, payload),
  createApprovedBooking: (booking: BookingRequest) =>
    api.post<Booking>("/api/admin/bookings/create", booking),
};

export default api;
