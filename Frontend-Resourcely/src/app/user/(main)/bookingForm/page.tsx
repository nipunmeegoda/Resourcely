// src/app/Booking/page.tsx
import { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaFileAlt, FaUsers } from "react-icons/fa";
import CascadingResourceSelector from "../../../../components/CascadingResourceSelector";
import type { Resource, BookingRequest } from "../../../../api";
import { bookingsApi } from "../../../../api";

export default function BookingPage() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [capacity, setCapacity] = useState("");
  const [contact, setContact] = useState("");

  const [errors, setErrors] = useState({
    resource: "",
    date: "",
    time: "",
    endTime: "",
    reason: "",
    capacity: "",
    contact: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset previous errors
    const newErrors = {
      resource: "",
      date: "",
      time: "",
      endTime: "",
      reason: "",
      capacity: "",
      contact: "",
    };

    // Validate each field
    if (!selectedResource) newErrors.resource = "Please select a resource";
    if (!date) newErrors.date = "Please select a date";
    if (!time) newErrors.time = "Please select a start time";
    if (!endTime) newErrors.endTime = "Please select an end time";
    if (!reason) newErrors.reason = "Please provide a reason";
    if (!contact) newErrors.contact = "Please enter contact information";
    if (!capacity) newErrors.capacity = "Please enter capacity";

    if (capacity && (isNaN(Number(capacity)) || Number(capacity) <= 0)) {
      newErrors.capacity = "Capacity must be a positive number";
    }

    if (
      selectedResource &&
      capacity &&
      Number(capacity) > selectedResource.capacity
    ) {
      newErrors.capacity = `Capacity cannot exceed resource capacity (${selectedResource.capacity})`;
    }

    // Validate time range
    if (time && endTime && time >= endTime) {
      newErrors.endTime = "End time must be after start time";
    }

    setErrors(newErrors);

    // Stop submission if any errors
    if (Object.values(newErrors).some((err) => err !== "")) return;

    if (!selectedResource) return;

    setIsSubmitting(true);

    try {
      const bookingData: BookingRequest = {
        resourceId: selectedResource.id,
        date,
        time,
        endTime,
        reason,
        capacity: Number(capacity),
        contact,
      };

      const response = await bookingsApi.create(bookingData);
      const booking = response.data;

      alert(`Booking submitted successfully! 
Resource: ${selectedResource.name}
Location: ${selectedResource.buildingName} > ${selectedResource.floorName} > ${selectedResource.blockName}
Date: ${date} ${time} - ${endTime}
Booking ID: ${booking.id}`);

      // Reset form
      setSelectedResource(null);
      setDate("");
      setTime("");
      setEndTime("");
      setReason("");
      setCapacity("");
      setContact("");
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit booking. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-100 lg:h-screen lg:overflow-hidden py-4 lg:py-2 px-4">
      <div className="max-w-4xl mx-auto lg:h-full lg:flex lg:flex-col">
        {/* Header */}
        <div className="text-center mb-6 lg:mb-4 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resource Booking System
          </h1>
          <p className="text-gray-600">
            Select a resource and enter your booking details below.
          </p>
        </div>

        {/* Main Form Container */}
        <div className="bg-yellow-100 rounded-xl shadow-lg border border-gray-200 overflow-hidden flex-shrink lg:flex-1">
          <form onSubmit={handleSubmit} className="p-6 lg:p-4 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-1 lg:gap-x-1 gap-y-1 lg:h-[calc(100vh-260px)] lg:min-h-0">
              <div className="lg:col-span-3 space-y-1">
                {/* Resource Selection */}
                <div className="form-group">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Select Resource *
                  </h3>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <CascadingResourceSelector
                      onResourceSelect={setSelectedResource}
                    />
                  </div>
                  {errors.resource && (
                    <div className="error mt-2 text-red-600 text-sm">
                      {errors.resource}
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div className="form-group mt-4">
                  <label
                    htmlFor="reason"
                    className="block text-lg font-semibold text-gray-700 mb-3"
                  >
                    <FaFileAlt className="inline mr-2 text-blue-600" />
                    Purpose/Reason *
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe the purpose of your booking..."
                    rows={4}
                    className={`w-full max-w-md px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none lg:text-base text-lg ${
                      errors.reason
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {errors.reason && (
                    <div className="error mt-2 text-red-600 text-sm">
                      {errors.reason}
                    </div>
                  )}
                </div>

                {/* Contact Field */}
                <div className="form-group mt-1">
                  <label
                    htmlFor="contact"
                    className="block text-lg font-semibold text-gray-700 mb-3"
                  >
                    <FaFileAlt className="inline mr-2 text-blue-600" />
                    Contact Information *
                  </label>
                  <input
                    id="contact"
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter your contact info"
                    className={`w-full max-w-md px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-base ${
                      errors.contact
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {errors.contact && (
                    <div className="error mt-2 text-red-600 text-sm">
                      {errors.contact}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Form Fields */}
              <div className="lg:col-span-2 space-y-1">
                {/* Date Selection */}
                <div className="form-group mt-1">
                  <label
                    htmlFor="booking-date"
                    className="block text-lg font-semibold text-gray-700 mb-3"
                  >
                    <FaCalendarAlt className="inline mr-2 text-blue-600" />
                    Booking Date *
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    title="Select booking date"
                    className={`w-full max-w-md px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors lg:text-base text-lg ${
                      errors.date
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {errors.date && (
                    <div className="error mt-2 text-red-600 text-sm">
                      {errors.date}
                    </div>
                  )}
                </div>

                {/* Start Time Selection */}
                <div className="form-group mt-1">
                  <label
                    htmlFor="booking-time"
                    className="block text-lg font-semibold text-gray-700 mb-3"
                  >
                    <FaClock className="inline mr-2 text-blue-600" />
                    Start Time *
                  </label>
                  <input
                    id="booking-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    title="Select start time"
                    className={`w-full max-w-md px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors lg:text-base text-lg ${
                      errors.time
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {errors.time && (
                    <div className="error mt-2 text-red-600 text-sm">
                      {errors.time}
                    </div>
                  )}
                </div>

                {/* End Time Selection */}
                <div className="form-group mt-1">
                  <label
                    htmlFor="booking-end-time"
                    className="block text-lg font-semibold text-gray-700 mb-3"
                  >
                    <FaClock className="inline mr-2 text-blue-600" />
                    End Time *
                  </label>
                  <input
                    id="booking-end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    title="Select end time"
                    className={`w-full max-w-md px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors lg:text-base text-lg ${
                      errors.endTime
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {errors.endTime && (
                    <div className="error mt-2 text-red-600 text-sm">
                      {errors.endTime}
                    </div>
                  )}
                </div>

                {/* Capacity Field */}
                <div className="form-group mt-1">
                  <label
                    htmlFor="capacity"
                    className="block text-lg font-semibold text-gray-700 mb-3"
                  >
                    <FaUsers className="inline mr-2 text-blue-600" />
                    Expected Attendees *
                  </label>
                  <input
                    id="capacity"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Enter number of attendees"
                    min="1"
                    max={selectedResource?.capacity || 999}
                    className={`w-full max-w-md px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-base ${
                      errors.capacity
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {selectedResource && (
                    <div className="text-xs text-gray-600 mt-1">
                      Maximum capacity: {selectedResource.capacity}
                    </div>
                  )}
                  {errors.capacity && (
                    <div className="error mt-2 text-red-600 text-sm">
                      {errors.capacity}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 lg:mt-4 pt-6 border-t-2 border-sky-200 flex flex-col items-center gap-4">
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedResource}
                  className={`font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg text-lg ${
                    isSubmitting || !selectedResource
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-sky-500 hover:bg-sky-600 hover:shadow-xl transform hover:scale-105"
                  } text-white`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Booking Request"}
                </button>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="bg-white hover:bg-sky-50 text-sky-600 font-bold py-3 px-8 rounded-lg border-2 border-sky-500 hover:border-sky-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
                >
                  Back to Rooms
                </button>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 bg-sky-50 px-4 py-2 rounded-lg border border-sky-200">
                  📧 You will receive a confirmation email once your request is
                  approved
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
