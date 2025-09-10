"use client";

import { useState } from "react";

type RoomStatus = "available" | "reserved" | "maintenance";

interface Room {
  id: string;
  name: string;
  capacity: number;
  type: "lecture-hall" | "lab";
  status: RoomStatus;
  equipment: string[];
  block: string;
  building: string;
  floor: number;
}

interface Building {
  id: string;
  name: string;
  floors: number[];
}

const buildings: Building[] = [
  { id: "new", name: "New Building", floors: [1, 2, 3] },
  { id: "old", name: "Old Building", floors: [1, 2] },
  { id: "science", name: "Science Building", floors: [1, 2, 3, 4] },
  { id: "engineering", name: "Engineering Building", floors: [1, 2, 3] },
];

const mockRooms: Room[] = [
  // New Building - Floor 1 - A Block - Lecture Halls
  {
    id: "LHA001",
    name: "LHA 001",
    capacity: 120,
    type: "lecture-hall",
    status: "available",
    equipment: ["Projector", "Audio System"],
    block: "A",
    building: "new",
    floor: 1,
  },
  {
    id: "LHA002",
    name: "LHA 002",
    capacity: 80,
    type: "lecture-hall",
    status: "available",
    equipment: ["Projector", "Whiteboard"],
    block: "A",
    building: "new",
    floor: 1,
  },
  {
    id: "LHA003",
    name: "LHA 003",
    capacity: 150,
    type: "lecture-hall",
    status: "available",
    equipment: ["Projector", "Audio System", "Recording"],
    block: "A",
    building: "new",
    floor: 1,
  },
  {
    id: "LHA004",
    name: "LHA 004",
    capacity: 100,
    type: "lecture-hall",
    status: "available",
    equipment: ["Projector", "Whiteboard"],
    block: "A",
    building: "new",
    floor: 1,
  },

  // New Building - Floor 1 - B Block - Lecture Halls
  {
    id: "LHB001",
    name: "LHB 001",
    capacity: 90,
    type: "lecture-hall",
    status: "available",
    equipment: ["Projector", "Audio System"],
    block: "B",
    building: "new",
    floor: 1,
  },
  {
    id: "LHB002",
    name: "LHB 002",
    capacity: 110,
    type: "lecture-hall",
    status: "available",
    equipment: ["Projector", "Whiteboard"],
    block: "B",
    building: "new",
    floor: 1,
  },
  {
    id: "LHB003",
    name: "LHB 003",
    capacity: 75,
    type: "lecture-hall",
    status: "available",
    equipment: ["Projector", "Audio System"],
    block: "B",
    building: "new",
    floor: 1,
  },
  {
    id: "LHB004",
    name: "LHB 004",
    capacity: 130,
    type: "lecture-hall",
    status: "available",
    equipment: ["Projector", "Recording"],
    block: "B",
    building: "new",
    floor: 1,
  },

  // New Building - Floor 1 - A Block - Labs
  {
    id: "LBA001",
    name: "LBA 001",
    capacity: 30,
    type: "lab",
    status: "available",
    equipment: ["Computers", "Projector"],
    block: "A",
    building: "new",
    floor: 1,
  },
  {
    id: "LBA002",
    name: "LBA 002",
    capacity: 25,
    type: "lab",
    status: "reserved",
    equipment: ["Computers", "Lab Equipment"],
    block: "A",
    building: "new",
    floor: 1,
  },
  {
    id: "LBA003",
    name: "LBA 003",
    capacity: 35,
    type: "lab",
    status: "maintenance",
    equipment: ["Computers", "Projector"],
    block: "A",
    building: "new",
    floor: 1,
  },
  {
    id: "LBA004",
    name: "LBA 004",
    capacity: 28,
    type: "lab",
    status: "reserved",
    equipment: ["Computers", "Whiteboard"],
    block: "A",
    building: "new",
    floor: 1,
  },

  // New Building - Floor 1 - B Block - Labs
  {
    id: "LBB001",
    name: "LBB 001",
    capacity: 32,
    type: "lab",
    status: "reserved",
    equipment: ["Computers", "Projector"],
    block: "B",
    building: "new",
    floor: 1,
  },
  {
    id: "LBB002",
    name: "LBB 002",
    capacity: 40,
    type: "lab",
    status: "maintenance",
    equipment: ["Computers", "Projector"],
    block: "B",
    building: "new",
    floor: 1,
  },
  {
    id: "LBB003",
    name: "LBB 003",
    capacity: 26,
    type: "lab",
    status: "reserved",
    equipment: ["Computers", "Whiteboard"],
    block: "B",
    building: "new",
    floor: 1,
  },
  {
    id: "LBB004",
    name: "LBB 004",
    capacity: 35,
    type: "lab",
    status: "available",
    equipment: ["Computers", "Audio System"],
    block: "B",
    building: "new",
    floor: 1,
  },

  // New Building - Floor 2 - Different layout
  {
    id: "LHA201",
    name: "LHA 201",
    capacity: 200,
    type: "lecture-hall",
    status: "available",
    equipment: ["Projector", "Audio System", "Recording"],
    block: "A",
    building: "new",
    floor: 2,
  },
  {
    id: "LHA202",
    name: "LHA 202",
    capacity: 180,
    type: "lecture-hall",
    status: "reserved",
    equipment: ["Projector", "Whiteboard"],
    block: "A",
    building: "new",
    floor: 2,
  },
  {
    id: "LHB201",
    name: "LHB 201",
    capacity: 160,
    type: "lecture-hall",
    status: "available",
    equipment: ["Projector", "Audio System"],
    block: "B",
    building: "new",
    floor: 2,
  },
  {
    id: "LHB202",
    name: "LHB 202",
    capacity: 140,
    type: "lecture-hall",
    status: "maintenance",
    equipment: ["Projector", "Recording"],
    block: "B",
    building: "new",
    floor: 2,
  },

  // Science Building - Floor 1
  {
    id: "SLA001",
    name: "SLA 001",
    capacity: 40,
    type: "lab",
    status: "available",
    equipment: ["Microscopes", "Lab Equipment"],
    block: "A",
    building: "science",
    floor: 1,
  },
  {
    id: "SLA002",
    name: "SLA 002",
    capacity: 35,
    type: "lab",
    status: "reserved",
    equipment: ["Chemicals", "Fume Hoods"],
    block: "A",
    building: "science",
    floor: 1,
  },
  {
    id: "SLB001",
    name: "SLB 001",
    capacity: 45,
    type: "lab",
    status: "available",
    equipment: ["Physics Equipment"],
    block: "B",
    building: "science",
    floor: 1,
  },
  {
    id: "SLB002",
    name: "SLB 002",
    capacity: 38,
    type: "lab",
    status: "maintenance",
    equipment: ["Biology Equipment"],
    block: "B",
    building: "science",
    floor: 1,
  },
];

export default function RoomBookingPage() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState("new");
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedDate, setSelectedDate] = useState("2025-09-03");
  const [selectedTime, setSelectedTime] = useState("22:30");
  const [buildingDropdownOpen, setBuildingDropdownOpen] = useState(false);
  const [floorDropdownOpen, setFloorDropdownOpen] = useState(false);

  const filteredRooms = mockRooms.filter(
    (room) => room.building === selectedBuilding && room.floor === selectedFloor
  );

  const currentBuilding = buildings.find((b) => b.id === selectedBuilding);
  const availableFloors = currentBuilding?.floors || [1];

  const handleRoomSelect = (room: Room) => {
    if (room.status === "available") {
      setSelectedRoom(room);
    }
  };

  const handleBookRoom = () => {
    if (selectedRoom) {
      setSelectedRoom(null);
      const formattedDate = new Date(selectedDate).toLocaleDateString();
      const formattedTime = new Date(
        `2000-01-01T${selectedTime}`
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      alert(
        `Room ${selectedRoom.name} has been booked successfully for ${formattedDate} at ${formattedTime}!`
      );
    }
  };

  const CustomDropdown = ({
    label,
    value,
    options,
    isOpen,
    setIsOpen,
    onSelect,
  }: {
    label: string;
    value: string | number;
    options: { id: string | number; name: string }[];
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onSelect: (value: string | number) => void;
  }) => (
    <div className="space-y-4">
      <label className="text-sm font-medium text-slate-300 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full cursor-pointer rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-white/10 py-4 pl-4 pr-12 text-left shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-white transition-all duration-300 hover:bg-slate-800/70"
        >
          <span className="block truncate font-medium">
            {options.find((opt) => opt.id === value)?.name}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <svg
              className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 py-2 shadow-2xl">
              {options.map((option) => (
                <button
                  key={option.id}
                  className="relative cursor-pointer select-none py-3 pl-12 pr-4 transition-colors duration-200 hover:bg-emerald-600/20 text-slate-200 hover:text-white w-full text-left"
                  onClick={() => {
                    onSelect(option.id);
                    setIsOpen(false);
                  }}
                >
                  <span
                    className={`block truncate ${
                      value === option.id ? "font-semibold" : "font-normal"
                    }`}
                  >
                    {option.name}
                  </span>
                  {value === option.id && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-400">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const RoomCard = ({
    room,
    className = "",
  }: {
    room: Room;
    className?: string;
  }) => (
    <div
      className={`relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl flex flex-col justify-center items-center gap-1 cursor-pointer transition-all duration-500 hover:scale-110 group ${
        room.status === "available"
          ? "bg-emerald-500/20 border border-emerald-400/30 hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-500/20 backdrop-blur-sm"
          : room.status === "reserved"
          ? "bg-slate-600/20 border border-slate-500/30 backdrop-blur-sm"
          : "bg-amber-500/20 border border-amber-400/30 backdrop-blur-sm"
      } ${className}`}
      onClick={() => handleRoomSelect(room)}
      onMouseEnter={() => setHoveredRoom(room)}
      onMouseLeave={() => setHoveredRoom(null)}
    >
      <div className="absolute inset-0 rounded-2xl bg-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 text-white text-xs md:text-sm font-medium tracking-wide">
        {room.name}
      </div>
      <div
        className={`relative z-10 w-2 h-2 rounded-full shadow-lg ${
          room.status === "available"
            ? "bg-emerald-400 shadow-emerald-400/50"
            : room.status === "reserved"
            ? "bg-slate-400 shadow-slate-400/50"
            : "bg-amber-400 shadow-amber-400/50"
        }`}
      />

      {hoveredRoom?.id === room.id && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full z-30 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-4 min-w-48 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-300">
          <div className="relative z-10">
            <div className="text-sm font-semibold text-white mb-1">
              {room.name}
            </div>
            <div className="text-xs text-slate-300 mb-1">
              {room.type === "lecture-hall" ? "Lecture Hall" : "Lab"} •{" "}
              {room.capacity} seats
            </div>
            <div className="text-xs text-slate-400 mb-3">
              {room.equipment.slice(0, 2).join(", ")}
              {room.equipment.length > 2 && "..."}
            </div>
            {room.status === "available" && (
              <div className="text-xs text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-1 rounded-lg">
                Available
              </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extralight text-white mb-4 tracking-tight">
              Room Booking
            </h1>
            <p className="text-slate-400 text-lg font-light">
              Book lecture halls and laboratories
            </p>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12 shadow-2xl">
            <div className="relative z-10 space-y-8">
              {/* Building Selection */}
              <CustomDropdown
                label="Building"
                value={selectedBuilding}
                options={buildings.map((b) => ({ id: b.id, name: b.name }))}
                isOpen={buildingDropdownOpen}
                setIsOpen={setBuildingDropdownOpen}
                onSelect={(value) => {
                  setSelectedBuilding(value as string);
                  const building = buildings.find((b) => b.id === value);
                  if (building && !building.floors.includes(selectedFloor)) {
                    setSelectedFloor(building.floors[0]);
                  }
                }}
              />

              {/* Floor Selection */}
              <CustomDropdown
                label="Floor"
                value={selectedFloor}
                options={availableFloors.map((f) => ({
                  id: f,
                  name: `Floor ${f}`,
                }))}
                isOpen={floorDropdownOpen}
                setIsOpen={setFloorDropdownOpen}
                onSelect={(value) => setSelectedFloor(value as number)}
              />

              {/* Date & Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300 tracking-wide">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-white/10 px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 hover:bg-slate-800/70"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300 tracking-wide">
                    Time
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-white/10 px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 hover:bg-slate-800/70"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-light text-white tracking-wide">
                  {currentBuilding?.name} • Floor {selectedFloor}
                </h2>
              </div>

              {filteredRooms.length > 0 ? (
                <div className="space-y-16">
                  {/* Block Layout */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
                    {/* A Block */}
                    {filteredRooms.some((room) => room.block === "A") && (
                      <div className="space-y-10">
                        <div className="text-center">
                          <div className="text-xl font-light text-white mb-8 pb-3 border-b border-white/10 tracking-wider">
                            Block A
                          </div>
                        </div>

                        {/* Lecture Halls */}
                        <div>
                          <h3 className="text-sm text-slate-400 mb-6 text-center font-medium tracking-wide">
                            Lecture Halls
                          </h3>
                          <div className="flex justify-center gap-4 flex-wrap">
                            {filteredRooms
                              .filter(
                                (room) =>
                                  room.block === "A" &&
                                  room.type === "lecture-hall"
                              )
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((room) => (
                                <RoomCard key={room.id} room={room} />
                              ))}
                          </div>
                        </div>

                        {/* Labs */}
                        <div>
                          <h3 className="text-sm text-slate-400 mb-6 text-center font-medium tracking-wide">
                            Laboratories
                          </h3>
                          <div className="flex justify-center gap-4 flex-wrap">
                            {filteredRooms
                              .filter(
                                (room) =>
                                  room.block === "A" && room.type === "lab"
                              )
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((room) => (
                                <RoomCard key={room.id} room={room} />
                              ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* B Block */}
                    {filteredRooms.some((room) => room.block === "B") && (
                      <div className="space-y-10">
                        <div className="text-center">
                          <div className="text-xl font-light text-white mb-8 pb-3 border-b border-white/10 tracking-wider">
                            Block B
                          </div>
                        </div>

                        {/* Lecture Halls */}
                        <div>
                          <h3 className="text-sm text-slate-400 mb-6 text-center font-medium tracking-wide">
                            Lecture Halls
                          </h3>
                          <div className="flex justify-center gap-4 flex-wrap">
                            {filteredRooms
                              .filter(
                                (room) =>
                                  room.block === "B" &&
                                  room.type === "lecture-hall"
                              )
                              .sort((a, b) => b.name.localeCompare(a.name))
                              .map((room) => (
                                <RoomCard key={room.id} room={room} />
                              ))}
                          </div>
                        </div>

                        {/* Labs */}
                        <div>
                          <h3 className="text-sm text-slate-400 mb-6 text-center font-medium tracking-wide">
                            Laboratories
                          </h3>
                          <div className="flex justify-center gap-4 flex-wrap">
                            {filteredRooms
                              .filter(
                                (room) =>
                                  room.block === "B" && room.type === "lab"
                              )
                              .sort((a, b) => b.name.localeCompare(a.name))
                              .map((room) => (
                                <RoomCard key={room.id} room={room} />
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center gap-12 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
                      <span className="text-sm text-slate-300 font-medium">
                        Available
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-slate-400 rounded-full shadow-lg shadow-slate-400/50" />
                      <span className="text-sm text-slate-300 font-medium">
                        Reserved
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />
                      <span className="text-sm text-slate-300 font-medium">
                        Maintenance
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-slate-400 text-xl font-light">
                    No rooms available
                  </div>
                  <div className="text-slate-500 text-sm mt-2">
                    Try selecting a different floor
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedRoom && (
            <>
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in-0 duration-300"
                onClick={() => setSelectedRoom(null)}
              />
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[90vw] max-w-md z-50 bg-slate-800/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="relative z-10">
                  <div className="p-8 border-b border-white/10">
                    <div className="flex items-center justify-between text-xl font-light">
                      <span className="text-white">
                        Book {selectedRoom.name}
                      </span>
                      <button
                        onClick={() => setSelectedRoom(null)}
                        className="h-10 w-10 rounded-2xl hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Type</span>
                        <span className="text-xs font-medium px-3 py-2 bg-slate-800/50 text-slate-200 rounded-xl backdrop-blur-sm">
                          {selectedRoom.type === "lecture-hall"
                            ? "Lecture Hall"
                            : "Laboratory"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Capacity</span>
                        <span className="text-sm text-white font-medium">
                          {selectedRoom.capacity}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <span className="text-sm text-slate-400">
                          Equipment
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedRoom.equipment.map((item) => (
                            <span
                              key={item}
                              className="text-xs px-3 py-2 bg-slate-800/50 border border-white/10 text-slate-200 rounded-xl backdrop-blur-sm"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <p className="text-sm text-slate-300 mb-6 font-medium">
                        {new Date(selectedDate).toLocaleDateString()} at{" "}
                        {new Date(
                          `2000-01-01T${selectedTime}`
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={handleBookRoom}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-2xl font-medium transition-all duration-300 shadow-lg"
                        >
                          Confirm Booking
                        </button>
                        <button
                          onClick={() => setSelectedRoom(null)}
                          className="py-4 px-6 text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
