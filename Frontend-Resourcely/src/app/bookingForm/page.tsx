// src/app/Booking/page.tsx
import "./Page.css";
import { useState } from "react";

export default function BookingPage() {
  const [resource, setResource] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const resources = ["Labs", "Lecture Halls", "Meeting Rooms"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ resource, date, time, reason });
    alert("Check console for submitted data!");
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
            required
          >
            <option value="">Select a resource</option>
            {resources.map((res) => (
              <option key={res} value={res}>
                {res}
              </option>
            ))}
          </select>
        </label>
        <br />
        <br />
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <br />
        <br />
        <label>
          Time:
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </label>
        <br />
        <br />
        <label>
          Reason:
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason"
            required
          />
        </label>
        <br />
        <br />
        <button type="submit">Check Availability</button>
      </form>
    </div>
  );
}
