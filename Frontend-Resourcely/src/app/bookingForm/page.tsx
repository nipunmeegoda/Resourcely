// src/app/Booking/page.tsx
import "./Page.css";
import { useState } from "react";

export default function BookingPage() {
  const [resource, setResource] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const resources = ["Labs", "Lecture Halls", "Meeting Rooms"];

  const [errors, setErrors] = useState({
    resource: "",
    date: "",
    time: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset previous errors
    const newErrors = { resource: "", date: "", time: "", reason: "" };

    // Validate each field
    if (!resource) newErrors.resource = "Please select a resource";
    if (!date) newErrors.date = "Please select a date";
    if (!time) newErrors.time = "Please select a time";
    if (!reason) newErrors.reason = "Please provide a reason";

    setErrors(newErrors);

    // Stop submission if any errors
    if (Object.values(newErrors).some((err) => err !== "")) return;

    // Submit if all fields are valid
    console.log({ resource, date, time, reason });
    alert("Booking submitted successfully!");
  };

  return (
    <div className="booking-container">
      <h1>Book a Resource</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Resource:
          <select
            value={resource}
            onChange={(e) => setResource(e.target.value)}
          >
            <option value="">Select a resource</option>
            {resources.map((res) => (
              <option key={res} value={res}>
                {res}
              </option>
            ))}
          </select>
        </label>
        <div className="error">{errors.resource}</div>

        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <div className="error">{errors.date}</div>

        <label>
          Time:
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
        <div className="error">{errors.time}</div>

        <label>
          Reason:
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason"
          />
        </label>
        <div className="error">{errors.reason}</div>

        <br />
        <br />
        <button type="submit">Check Availability</button>
      </form>
    </div>
  );
}
