import React, { useState, useEffect } from "react";
import { createBooking, getAvailableResourceTypes } from "../services/booking";
import type { BookingCreateRequest } from "../types/booking";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface BookingFormProps {
  userId: number;
  userRole: string;
  onBookingCreated?: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  userId,
  userRole,
  onBookingCreated,
}) => {
  const [availableResourceTypes, setAvailableResourceTypes] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<BookingCreateRequest>({
    location: "",
    resourceType: "Regular",
    date: "",
    time: "",
    reason: "",
    capacity: 1,
    contact: "",
    userId,
  });

  useEffect(() => {
    const fetchAvailableTypes = async () => {
      try {
        const types = await getAvailableResourceTypes(userId);
        setAvailableResourceTypes(types);
        if (types.length > 0 && !types.includes(formData.resourceType)) {
          setFormData((prev: BookingCreateRequest) => ({
            ...prev,
            resourceType: types[0],
          }));
        }
      } catch (err) {
        console.error("Failed to fetch available resource types:", err);
        // Fallback to default based on role
        const fallbackTypes =
          userRole === "Admin"
            ? ["Regular", "Lab", "Special"]
            : userRole === "Teacher"
            ? ["Regular", "Lab"]
            : ["Regular"];
        setAvailableResourceTypes(fallbackTypes);
      }
    };

    fetchAvailableTypes();
  }, [userId, userRole, formData.resourceType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await createBooking(formData);
      setSuccess(true);
      setFormData({
        location: "",
        resourceType: availableResourceTypes[0] || "Regular",
        date: "",
        time: "",
        reason: "",
        capacity: 1,
        contact: "",
        userId,
      });
      onBookingCreated?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: BookingCreateRequest) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) || 1 : value,
    }));
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Book a Resource</CardTitle>
        <CardDescription>
          Available resource types for {userRole}:{" "}
          {availableResourceTypes.join(", ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            Booking created successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Room 101, Conference Room A, etc."
            />
          </div>

          <div>
            <label
              htmlFor="resourceType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Resource Type
            </label>
            <select
              id="resourceType"
              name="resourceType"
              value={formData.resourceType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableResourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {availableResourceTypes.length === 1 &&
              availableResourceTypes[0] === "Regular" && (
                <p className="text-xs text-gray-500 mt-1">
                  Only regular resources are available for your role.
                </p>
              )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="capacity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Capacity
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reason
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Purpose of the booking..."
            />
          </div>

          <div>
            <label
              htmlFor="contact"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contact
            </label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email or phone number"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Book Resource"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
