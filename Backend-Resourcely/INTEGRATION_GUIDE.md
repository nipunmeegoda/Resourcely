# Campus Resource Management System - Integration Guide

## Backend Setup Complete ✅

Your .NET backend API is now ready with the following features:

### 📊 Database Schema

- **Buildings** → **Floors** → **Blocks** → **Locations** hierarchy
- **Users** with role-based access (admin, lecturer, student, manager)
- **Bookings** with approval workflow
- **ResourceAvailability** for time slot management

### 🔧 API Endpoints

#### Resource Management (Admin-focused)

**Buildings:**

- `GET /api/buildings` - List all buildings with full hierarchy
- `GET /api/buildings/{id}` - Get specific building
- `POST /api/buildings` - Create new building
- `PUT /api/buildings/{id}` - Update building
- `DELETE /api/buildings/{id}` - Delete building

**Floors:**

- `GET /api/floors` - List all floors
- `GET /api/floors/{id}` - Get specific floor
- `GET /api/floors/byBuilding/{buildingId}` - Floors by building
- `POST /api/floors` - Create new floor
- `PUT /api/floors/{id}` - Update floor
- `DELETE /api/floors/{id}` - Delete floor

**Blocks:**

- `GET /api/blocks` - List all blocks
- `GET /api/blocks/{id}` - Get specific block
- `GET /api/blocks/byFloor/{floorId}` - Blocks by floor
- `POST /api/blocks` - Create new block
- `PUT /api/blocks/{id}` - Update block
- `DELETE /api/blocks/{id}` - Delete block

**Locations:**

- `GET /api/locations` - List all locations with hierarchy info
- `GET /api/locations/{id}` - Get specific location
- `GET /api/locations/byBlock/{blockId}` - Locations by block
- `GET /api/locations/byHierarchy?buildingId=1&floorId=2` - Filter by hierarchy
- `POST /api/locations` - Create new location
- `PUT /api/locations/{id}` - Update location
- `DELETE /api/locations/{id}` - Delete location

#### Availability & Booking

**Availability:**

- `POST /api/availability/check` - Check if time slot is available
- `GET /api/availability/{locationId}/slots?date=2025-09-21` - Available slots for day
- `GET /api/availability/{locationId}/day-overview?date=2025-09-21` - Full day overview

**Bookings:**

- `GET /api/bookings` - List all bookings
- `GET /api/bookings/{id}` - Get specific booking
- `GET /api/bookings/byLocation/{locationId}` - Bookings for location
- `GET /api/bookings/pending` - Pending approval bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/{id}/approve` - Approve booking
- `PUT /api/bookings/{id}/reject` - Reject booking
- `PUT /api/bookings/{id}/cancel` - Cancel booking

## 🚀 Running the Backend

1. **Navigate to backend directory:**

   ```powershell
   cd "C:\Users\draup\OneDrive\Documents\Github\Resourcely\Backend-Resourcely\Backend-Resourcely"
   ```

2. **Start the server:**

   ```powershell
   dotnet run
   ```

   The API will be available at:

   - HTTP: `http://localhost:5000`
   - HTTPS: `https://localhost:5001`
   - Swagger UI: `https://localhost:5001/swagger`

## 📱 Frontend Integration Guide

### Step 1: Update Your React Frontend

1. **Create API Service File** (`src/services/api.js`):

```javascript
const API_BASE_URL = "https://localhost:5001/api";

class ResourceAPI {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Buildings
  getBuildings() {
    return this.request("/buildings");
  }

  getBuilding(id) {
    return this.request(`/buildings/${id}`);
  }

  // Floors
  getFloorsByBuilding(buildingId) {
    return this.request(`/floors/byBuilding/${buildingId}`);
  }

  // Blocks
  getBlocksByFloor(floorId) {
    return this.request(`/blocks/byFloor/${floorId}`);
  }

  // Locations
  getLocationsByBlock(blockId) {
    return this.request(`/locations/byBlock/${blockId}`);
  }

  getLocationsByHierarchy(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return this.request(`/locations/byHierarchy?${params}`);
  }

  // Availability
  checkAvailability(locationId, startDateTime, endDateTime) {
    return this.request("/availability/check", {
      method: "POST",
      body: {
        locationID: locationId,
        startDateTime,
        endDateTime,
      },
    });
  }

  getAvailableSlots(locationId, date) {
    return this.request(`/availability/${locationId}/slots?date=${date}`);
  }

  getDayOverview(locationId, date) {
    return this.request(
      `/availability/${locationId}/day-overview?date=${date}`
    );
  }

  // Bookings
  createBooking(locationId, startsAt, endsAt, purpose) {
    return this.request("/bookings", {
      method: "POST",
      body: {
        locationID: locationId,
        startsAt,
        endsAt,
        purpose,
      },
    });
  }

  getBookings() {
    return this.request("/bookings");
  }

  approveBooking(bookingId) {
    return this.request(`/bookings/${bookingId}/approve`, {
      method: "PUT",
    });
  }
}

export const api = new ResourceAPI();
```

### Step 2: Create Resource Selection Component

2. **Building/Floor/Block/Resource Selector** (`src/components/ResourceSelector.jsx`):

```jsx
import React, { useState, useEffect } from "react";
import { api } from "../services/api";

const ResourceSelector = ({ onResourceSelect }) => {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [locations, setLocations] = useState([]);

  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const data = await api.getBuildings();
      setBuildings(data);
    } catch (error) {
      console.error("Failed to load buildings:", error);
    }
  };

  const handleBuildingChange = async (buildingId) => {
    setSelectedBuilding(buildingId);
    setSelectedFloor("");
    setSelectedBlock("");
    setSelectedLocation("");
    setFloors([]);
    setBlocks([]);
    setLocations([]);

    if (buildingId) {
      try {
        const data = await api.getFloorsByBuilding(buildingId);
        setFloors(data);
      } catch (error) {
        console.error("Failed to load floors:", error);
      }
    }
  };

  const handleFloorChange = async (floorId) => {
    setSelectedFloor(floorId);
    setSelectedBlock("");
    setSelectedLocation("");
    setBlocks([]);
    setLocations([]);

    if (floorId) {
      try {
        const data = await api.getBlocksByFloor(floorId);
        setBlocks(data);
      } catch (error) {
        console.error("Failed to load blocks:", error);
      }
    }
  };

  const handleBlockChange = async (blockId) => {
    setSelectedBlock(blockId);
    setSelectedLocation("");
    setLocations([]);

    if (blockId) {
      try {
        const data = await api.getLocationsByBlock(blockId);
        setLocations(data);
      } catch (error) {
        console.error("Failed to load locations:", error);
      }
    }
  };

  const handleLocationChange = (locationId) => {
    setSelectedLocation(locationId);
    const location = locations.find(
      (l) => l.locationID === parseInt(locationId)
    );
    if (location && onResourceSelect) {
      onResourceSelect(location);
    }
  };

  return (
    <div className="resource-selector">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Building Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Building
          </label>
          <select
            value={selectedBuilding}
            onChange={(e) => handleBuildingChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select Building</option>
            {buildings.map((building) => (
              <option key={building.buildingID} value={building.buildingID}>
                {building.buildingName}
              </option>
            ))}
          </select>
        </div>

        {/* Floor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Floor
          </label>
          <select
            value={selectedFloor}
            onChange={(e) => handleFloorChange(e.target.value)}
            disabled={!selectedBuilding}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100"
          >
            <option value="">Select Floor</option>
            {floors.map((floor) => (
              <option key={floor.floorID} value={floor.floorID}>
                {floor.floorName}
              </option>
            ))}
          </select>
        </div>

        {/* Block Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Block
          </label>
          <select
            value={selectedBlock}
            onChange={(e) => handleBlockChange(e.target.value)}
            disabled={!selectedFloor}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100"
          >
            <option value="">Select Block</option>
            {blocks.map((block) => (
              <option key={block.blockID} value={block.blockID}>
                {block.blockName}
              </option>
            ))}
          </select>
        </div>

        {/* Location/Resource Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Resource
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            disabled={!selectedBlock}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100"
          >
            <option value="">Select Resource</option>
            {locations.map((location) => (
              <option key={location.locationID} value={location.locationID}>
                {location.locationName} ({location.locationType})
                {location.capacity && ` - ${location.capacity} seats`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ResourceSelector;
```

### Step 3: Create Booking Component

3. **Booking Interface** (`src/components/BookingForm.jsx`):

```jsx
import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import ResourceSelector from "./ResourceSelector";

const BookingForm = () => {
  const [selectedResource, setSelectedResource] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [purpose, setPurpose] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);

  useEffect(() => {
    if (selectedResource && date) {
      checkAvailability();
    }
  }, [selectedResource, date, startTime, endTime]);

  const checkAvailability = async () => {
    if (!selectedResource || !date || !startTime || !endTime) return;

    setIsChecking(true);
    try {
      const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

      const availability = await api.checkAvailability(
        selectedResource.locationID,
        startDateTime,
        endDateTime
      );

      setAvailableSlots(availability.availableSlots);
      setBookingStatus(availability.isAvailable ? "available" : "conflict");
    } catch (error) {
      console.error("Failed to check availability:", error);
      setBookingStatus("error");
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResource || bookingStatus !== "available") return;

    try {
      const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

      const booking = await api.createBooking(
        selectedResource.locationID,
        startDateTime,
        endDateTime,
        purpose
      );

      alert("Booking created successfully! Waiting for approval.");
      // Reset form
      setPurpose("");
      setBookingStatus(null);
    } catch (error) {
      console.error("Failed to create booking:", error);
      alert("Failed to create booking. Please try again.");
    }
  };

  return (
    <div className="booking-form max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Book a Resource</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resource Selection */}
        <div>
          <h3 className="text-lg font-medium mb-4">Select Resource</h3>
          <ResourceSelector onResourceSelect={setSelectedResource} />
        </div>

        {selectedResource && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Selected Resource</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p>
                <strong>Location:</strong> {selectedResource.locationName}
              </p>
              <p>
                <strong>Type:</strong> {selectedResource.locationType}
              </p>
              <p>
                <strong>Capacity:</strong>{" "}
                {selectedResource.capacity || "Not specified"}
              </p>
              <p>
                <strong>Building:</strong> {selectedResource.buildingName}
              </p>
              <p>
                <strong>Floor:</strong> {selectedResource.floorName}
              </p>
              <p>
                <strong>Block:</strong> {selectedResource.blockName}
              </p>
            </div>
          </div>
        )}

        {/* Date & Time Selection */}
        {selectedResource && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Availability Status */}
        {selectedResource && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Availability Status</h3>
            {isChecking ? (
              <p className="text-blue-600">Checking availability...</p>
            ) : bookingStatus === "available" ? (
              <p className="text-green-600">✅ Time slot is available!</p>
            ) : bookingStatus === "conflict" ? (
              <p className="text-red-600">
                ❌ Time slot conflicts with existing bookings
              </p>
            ) : bookingStatus === "error" ? (
              <p className="text-red-600">Error checking availability</p>
            ) : null}
          </div>
        )}

        {/* Purpose */}
        {selectedResource && (
          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700">
              Purpose
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Describe the purpose of your booking..."
              required
            />
          </div>
        )}

        {/* Submit */}
        {selectedResource && (
          <div className="border-t pt-6">
            <button
              type="submit"
              disabled={
                !selectedResource ||
                bookingStatus !== "available" ||
                !purpose.trim()
              }
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Create Booking
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BookingForm;
```

### Step 4: Update Your App Component

4. **Integrate into your main App** (`src/App.jsx`):

```jsx
import React from "react";
import BookingForm from "./components/BookingForm";

function App() {
  return (
    <div className="App">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Campus Resource Management</h1>
      </header>
      <main className="container mx-auto py-8">
        <BookingForm />
      </main>
    </div>
  );
}

export default App;
```

## 🔧 Configuration Notes

### CORS Settings

The backend is configured to accept requests from:

- `http://localhost:3000` (Create React App)
- `http://localhost:5173` (Vite)

### Database

- Uses SQLite database (`resourcely.db`)
- Includes seed data with sample buildings, floors, blocks, and locations
- Database is created automatically on first run

### Sample Data

The system includes:

- 2 Buildings (Main Building, Engineering Block)
- 3 Floors across buildings
- 4 Blocks across floors
- 5 Sample locations (lecture halls, labs, meeting rooms)
- 3 Sample users (admin, lecturer, student)

## 🚀 Next Steps

1. **Start the backend** using the commands above
2. **Update your React frontend** with the provided code
3. **Install any missing dependencies** in your React project
4. **Test the integration** by accessing the booking interface

The system now supports:

- ✅ Hierarchical resource selection (Building → Floor → Block → Location)
- ✅ Real-time availability checking
- ✅ Booking creation with conflict prevention
- ✅ Admin approval workflow
- ✅ Full CRUD operations for resource management

Your campus resource management system is ready for use! 🎉
