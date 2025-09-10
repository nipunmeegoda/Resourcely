// src/app/Booking/page.tsx
import { useState } from "react";

export default function BookingPage() {
  const [resource, setResource] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const resources = ["Lab 1", "Lab 2", "Meeting Room A", "Lecture Hall 1"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ resource, date, time, reason });
    alert("Check console for submitted data!");
  };

  return (
    <div style={{ padding: "20px" }}>
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
        <button type="submit">Submit Booking</button>
      </form>
    </div>
  );
}
