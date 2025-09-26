// src/app/Booking/page.tsx
import { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaFileAlt, FaUsers } from "react-icons/fa";
import { FaLocationPin } from "react-icons/fa6";

export default function BookingPage() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [contact, setContact] = useState("");

  const [errors, setErrors] = useState({
    resource: "",
    location: "",
    date: "",
    time: "",
    reason: "",
    capacity: "", // NEW
    contact: "", // NEW
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset previous errors
    const newErrors = {
      resource: "",
      location: "",
      date: "",
      time: "",
      reason: "",
      capacity: "",
      contact: "",
    };

    // Validate each field
    if (!location) newErrors.location = "Please enter location";
    if (!date) newErrors.date = "Please select a date";
    if (!time) newErrors.time = "Please select a time";
    if (!reason) newErrors.reason = "Please provide a reason";
    if (!contact) newErrors.contact = "Please enter contact information";
    if (!capacity) newErrors.capacity = "Please enter capacity"; // NEW
    if (capacity && (isNaN(Number(capacity)) || Number(capacity) <= 0)) {
      newErrors.capacity = "Capacity must be a positive number";
    }

    setErrors(newErrors);

    // Stop submission if any errors
    if (Object.values(newErrors).some((err) => err !== "")) return;

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          date,
          time,
          reason,
          capacity: Number(capacity),
          contact,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to submit booking");
      }

      const data = await response.json();
      alert(`Booking submitted successfully! ID: ${data.id ?? data.Id ?? ""}`);

      // Reset form
      setLocation("");
      setDate("");
      setTime("");
      setReason("");
      setCapacity("");
      setContact("");
    } catch (error) {
      console.error(error);
      alert("Failed to submit booking. Please try again.");
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
            Enter your booking details below to request a resource.
          </p>
        </div>

        {/* Main Form Container */}
        <div className="bg-yellow-100 rounded-xl shadow-lg border border-gray-200 overflow-hidden flex-shrink lg:flex-1">
          <form onSubmit={handleSubmit} className="p-6 lg:p-4 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-x-1 lg:gap-x-1 gap-y-1 lg:h-[calc(100vh-260px)] lg:min-h-0">
              <div className="lg:col-span-3 space-y-1">
                <div className="form-group">
                  {/* Location Field */}
                  <div className="form-group mt-1">
                    <label
                      htmlFor="location"
                      className="block text-lg font-semibold text-gray-700 mb-3"
                    >
                      <FaLocationPin className="inline mr-2 text-blue-600" />
                      Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location (Lecture Hall B501) "
                      className="w-full max-w-md px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-base border-gray-300 hover:border-gray-400"
                    />
                    {errors.location && (
                      <div className="error mt-2">{errors.location}</div>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="form-group mt-4">
                    <label
                      htmlFor="reason"
                      className="block text-lg font-semibold text-gray-700 mb-3"
                    >
                      <FaFileAlt className="inline mr-2 text-blue-600" />
                      Purpose/Reason
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
                      <div className="error mt-2">{errors.reason}</div>
                    )}
                  </div>

                  {/* Contact Field */}
                  <div className="form-group mt-1">
                    <label
                      htmlFor="contact"
                      className="block text-lg font-semibold text-gray-700 mb-3"
                    >
                      <FaFileAlt className="inline mr-2 text-blue-600" />
                      Contact Information
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
                      <div className="error mt-2">{errors.contact}</div>
                    )}
                  </div>

                  {errors.resource && (
                    <div className="error mt-3">{errors.resource}</div>
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
                    Booking Date
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    title="Select booking date"
                    className={`w-full max-w-md px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors lg:text-base text-lg ${
                      errors.date
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {errors.date && (
                    <div className="error mt-2">{errors.date}</div>
                  )}
                </div>

                {/* Time Selection */}
                <div className="form-group mt-1">
                  <label
                    htmlFor="booking-time"
                    className="block text-lg font-semibold text-gray-700 mb-3"
                  >
                    <FaClock className="inline mr-2 text-blue-600" />
                    Preferred Time
                  </label>
                  <input
                    id="booking-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    title="Select preferred time"
                    className={`w-full max-w-md px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors lg:text-base text-lg ${
                      errors.time
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {errors.time && (
                    <div className="error mt-2">{errors.time}</div>
                  )}
                </div>

                {/* Capacity Field */}
                <div className="form-group mt-1">
                  <label
                    htmlFor="capacity"
                    className="block text-lg font-semibold text-gray-700 mb-3"
                  >
                    <FaUsers className="inline mr-2 text-blue-600" />
                    Capacity
                  </label>
                  <input
                    id="capacity"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Enter capacity"
                    className={`w-full max-w-md px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-base ${
                      errors.capacity
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  />
                  {errors.capacity && (
                    <div className="error mt-2">{errors.capacity}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 lg:mt-4 pt-6 border-t-2 border-sky-200 flex flex-col items-center gap-4">
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
                >
                  Submit Booking Request
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
