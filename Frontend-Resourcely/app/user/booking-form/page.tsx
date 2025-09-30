"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, FileText, Users, ArrowLeft, Send, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import CascadingResourceSelector from "@/components/CascadingResourceSelector";
import type { Resource, BookingRequest } from "@/api/api";
import { bookingsApi } from "@/api/api";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const router = useRouter();
  
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
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

  // Load pending booking data from localStorage if available
  useEffect(() => {
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking) {
      try {
        const bookingData = JSON.parse(pendingBooking);
        setDate(bookingData.date || date);
        setTime(bookingData.time || time);
        // Clear the stored data after loading
        localStorage.removeItem('pendingBooking');
      } catch (error) {
        console.error('Error loading pending booking:', error);
      }
    }
  }, []);

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

      toast.success(`Booking submitted successfully!`, {
        description: `Resource: ${selectedResource.name}\nLocation: ${selectedResource.buildingName} > ${selectedResource.floorName} > ${selectedResource.blockName}\nDate: ${date} ${time} - ${endTime}\nBooking ID: ${booking.id}`,
        duration: 5000,
      });

      // Reset form and redirect after a short delay
      setTimeout(() => {
        router.push('/user/booking');
      }, 2000);
    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to submit booking. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-black text-balance">
            Resource Booking
          </h1>
          <div className="w-16 h-1 bg-sky-400 mx-auto"></div>
          <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Complete your booking request by filling out the details below
          </p>
        </div>

        {/* Main Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Resource Selection & Details */}
            <div className="space-y-6">
              {/* Resource Selection Card */}
              <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
                <CardHeader className="pb-4 border-b border-sky-100">
                  <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-sky-500" />
                    Select Resource
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <CascadingResourceSelector onResourceSelect={setSelectedResource} />
                  {errors.resource && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm font-medium">{errors.resource}</p>
                    </div>
                  )}
                  
                  {/* Selected Resource Summary */}
                  {selectedResource && (
                    <div className="mt-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                      <h4 className="font-semibold text-black mb-2">Selected Resource:</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedResource.name}</p>
                        <p><span className="font-medium">Type:</span> {selectedResource.type}</p>
                        <p><span className="font-medium">Capacity:</span> {selectedResource.capacity} people</p>
                        <p><span className="font-medium">Location:</span> {selectedResource.buildingName} › {selectedResource.floorName} › {selectedResource.blockName}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Purpose Card */}
              <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
                <CardHeader className="pb-4 border-b border-sky-100">
                  <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-500" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="reason" className="text-sm font-medium text-black">
                      Purpose/Reason *
                    </Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please describe the purpose of your booking..."
                      rows={4}
                      className={`w-full resize-none border-sky-200 focus:border-sky-400 focus:ring-sky-200 ${
                        errors.reason ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {errors.reason && (
                      <p className="text-red-600 text-sm font-medium">{errors.reason}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="contact" className="text-sm font-medium text-black">
                      Contact Information *
                    </Label>
                    <Input
                      id="contact"
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Phone number or email address"
                      className={`border-sky-200 focus:border-sky-400 focus:ring-sky-200 ${
                        errors.contact ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {errors.contact && (
                      <p className="text-red-600 text-sm font-medium">{errors.contact}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Date, Time & Capacity */}
            <div className="space-y-6">
              {/* Date & Time Card */}
              <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
                <CardHeader className="pb-4 border-b border-sky-100">
                  <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-500" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="booking-date" className="text-sm font-medium text-black">
                      Booking Date *
                    </Label>
                    <Input
                      id="booking-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className={`border-sky-200 focus:border-sky-400 focus:ring-sky-200 ${
                        errors.date ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {errors.date && (
                      <p className="text-red-600 text-sm font-medium">{errors.date}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="booking-time" className="text-sm font-medium text-black">
                        <Clock className="inline w-4 h-4 mr-1 text-sky-500" />
                        Start Time *
                      </Label>
                      <Input
                        id="booking-time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className={`border-sky-200 focus:border-sky-400 focus:ring-sky-200 ${
                          errors.time ? "border-red-300 bg-red-50" : ""
                        }`}
                      />
                      {errors.time && (
                        <p className="text-red-600 text-sm font-medium">{errors.time}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="booking-end-time" className="text-sm font-medium text-black">
                        <Clock className="inline w-4 h-4 mr-1 text-sky-500" />
                        End Time *
                      </Label>
                      <Input
                        id="booking-end-time"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className={`border-sky-200 focus:border-sky-400 focus:ring-sky-200 ${
                          errors.endTime ? "border-red-300 bg-red-50" : ""
                        }`}
                      />
                      {errors.endTime && (
                        <p className="text-red-600 text-sm font-medium">{errors.endTime}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Capacity Card */}
              <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
                <CardHeader className="pb-4 border-b border-sky-100">
                  <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
                    <Users className="w-5 h-5 text-sky-500" />
                    Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Label htmlFor="capacity" className="text-sm font-medium text-black">
                      Expected Attendees *
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="Number of people"
                      min="1"
                      max={selectedResource?.capacity || 999}
                      className={`border-sky-200 focus:border-sky-400 focus:ring-sky-200 ${
                        errors.capacity ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {selectedResource && (
                      <p className="text-sky-600 text-sm">
                        Maximum capacity: <span className="font-semibold">{selectedResource.capacity}</span> people
                      </p>
                    )}
                    {errors.capacity && (
                      <p className="text-red-600 text-sm font-medium">{errors.capacity}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Section */}
          <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedResource}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Booking Request
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/user/booking')}
                    className="bg-white hover:bg-sky-50 text-sky-600 font-semibold py-3 px-8 border-2 border-sky-500 hover:border-sky-600 text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Rooms
                  </Button>
                </div>
                
                <div className="text-center max-w-md">
                  <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                    <p className="text-sm text-sky-700 flex items-center justify-center gap-2">
                      <span className="text-lg">📧</span>
                      You will receive a confirmation email once your request is reviewed and approved
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
