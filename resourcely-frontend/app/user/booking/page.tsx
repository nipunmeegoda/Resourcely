"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Info,
  BuildingIcon,
  Calendar,
  Clock,
  Users,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Presentation,
  FlaskConical,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

const buildings: Building[] = [];

const mockRooms: Room[] = [];

export default function BookingPage() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedDate, setSelectedDate] = useState("2025-09-03");
  const [selectedTime, setSelectedTime] = useState("22:30");
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);
  const [clickedInfoRoom, setClickedInfoRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const router = useRouter();

  useEffect(() => {
    setRooms(mockRooms);
  }, []);

  const filteredRooms = rooms.filter(
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
    setSelectedRoom(null);
    router.push("/user/bookingForm");
  };

  const RoomCard = ({ room }: { room: Room }) => {
    const getStatusStyles = (status: RoomStatus) => {
      switch (status) {
        case "available":
          return {
            color: "green",
            bg: "bg-sky-50 hover:bg-sky-100",
            border: "border-sky-200 hover:border-sky-400",
            text: "text-black",
            badge: "bg-white text-black border-sky-200",
          };
        case "reserved":
          return {
            color: "red",
            bg: "bg-gray-100 hover:bg-gray-200",
            border: "border-gray-400 hover:border-black",
            text: "text-black",
            badge: "bg-white text-black border-gray-400",
          };
        case "maintenance":
          return {
            color: "yellow",
            bg: "bg-amber-50 hover:bg-amber-100",
            border: "border-amber-300 hover:border-amber-400",
            text: "text-black",
            badge: "bg-white text-black border-amber-300",
          };
      }
    };

    const styles = getStatusStyles(room.status);
    const isTooltipVisible =
      hoveredRoom?.id === room.id || clickedInfoRoom?.id === room.id;

    const handleInfoClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setClickedInfoRoom(clickedInfoRoom?.id === room.id ? null : room);
    };

    return (
      <div className="relative">
        <Card
          className={`w-32 sm:w-36 md:w-40 h-32 sm:h-36 md:h-40 transition-all duration-300 cursor-pointer ${
            styles!.bg
          } ${styles!.border} border-2 ${
            room.status === "available"
              ? "hover:scale-105 hover:shadow-lg hover:shadow-sky-200/50"
              : "cursor-not-allowed opacity-75"
          }`}
          onClick={() => handleRoomSelect(room)}
          onMouseEnter={() => setHoveredRoom(room)}
          onMouseLeave={() => setHoveredRoom(null)}
        >
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-sky-100 hover:text-sky-600 transition-colors z-10"
            onClick={handleInfoClick}
          >
            <Info className="h-3 w-3" />
          </Button>

          <CardContent className="p-2 sm:p-3 md:p-4 h-full flex flex-col justify-between items-center">
            <div className="text-center space-y-1 sm:space-y-2">
              <div
                className={`font-bold text-sm sm:text-base md:text-lg ${
                  styles!.text
                }`}
              >
                {room.name}
              </div>
              <Badge
                className={`text-xs ${
                  styles!.badge
                } border flex items-center gap-1 justify-center`}
              >
                {room.status === "available" ? (
                  <CheckCircle className="w-2 h-2 text-sky-500" />
                ) : room.status === "reserved" ? (
                  <XCircle className="w-2 h-2 text-gray-500" />
                ) : (
                  <AlertTriangle className="w-2 h-2 text-amber-500" />
                )}
                {room.status === "available"
                  ? "Available"
                  : room.status === "reserved"
                  ? "Reserved"
                  : "Maintenance"}
              </Badge>
            </div>
            <div
              className={`text-xs sm:text-sm text-center ${
                styles!.text
              } flex items-center gap-1`}
            >
              <Users className="w-3 h-3" />
              {room.capacity} seats
            </div>
          </CardContent>
        </Card>

        {isTooltipVisible && (
          <div className="absolute z-20 top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 sm:w-64 p-3 sm:p-4 bg-white border border-sky-200 rounded-lg shadow-xl shadow-sky-100/50">
            <div className="space-y-2 sm:space-y-3">
              <div className="font-semibold text-black text-sm sm:text-base flex items-center gap-2">
                {room.type === "lecture-hall" ? (
                  <Presentation className="w-4 h-4 text-sky-500" />
                ) : (
                  <FlaskConical className="w-4 h-4 text-sky-500" />
                )}
                {room.name}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <div className="font-medium text-black">
                    {room.type === "lecture-hall"
                      ? "Lecture Hall"
                      : "Laboratory"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Capacity:</span>
                  <div className="font-medium text-black flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {room.capacity} seats
                  </div>
                </div>
              </div>
              <div>
                <span className="text-gray-600 text-xs sm:text-sm">
                  Equipment:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {room.equipment.map((item) => (
                    <Badge
                      key={item}
                      variant="outline"
                      className="text-sm bg-sky-50 text-black border-sky-200"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-3 sm:p-4 md:p-6 lg:p-8">
      <div
        className="max-w-7xl mx-auto space-y-6 sm:space-y-8"
        onClick={() => setClickedInfoRoom(null)}
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-black text-balance">
            Resourcely
          </h1>
          <div className="w-16 h-1 bg-sky-400 mx-auto"></div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Book lecture halls and laboratories efficiently
          </p>
        </div>

        <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
          <CardHeader className="pb-6 border-b border-sky-100">
            <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-500" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="building"
                  className="text-sm font-medium text-black flex items-center gap-2"
                >
                  <BuildingIcon className="w-4 h-4 text-sky-500" />
                  Building
                </Label>
                <Select
                  value={selectedBuilding}
                  onValueChange={setSelectedBuilding}
                >
                  <SelectTrigger className="h-10 border border-sky-200 bg-white hover:border-sky-400 hover:shadow-md hover:shadow-sky-100/50 transition-all duration-200 focus:ring-2 focus:ring-sky-200">
                    <SelectValue placeholder="Select building" />
                    <ChevronDown className="w-4 h-4 text-sky-500" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-sky-200 shadow-lg">
                    {buildings.map((building) => (
                      <SelectItem
                        key={building.id}
                        value={building.id}
                        className="hover:bg-sky-50 focus:bg-sky-50"
                      >
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="floor"
                  className="text-sm font-medium text-black"
                >
                  Floor
                </Label>
                <Select
                  value={selectedFloor.toString()}
                  onValueChange={(value) =>
                    setSelectedFloor(Number.parseInt(value))
                  }
                >
                  <SelectTrigger className="h-10 border border-sky-200 bg-white hover:border-sky-400 hover:shadow-md hover:shadow-sky-100/50 transition-all duration-200 focus:ring-2 focus:ring-sky-200">
                    <SelectValue placeholder="Select floor" />
                    <ChevronDown className="w-4 h-4 text-sky-500" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-sky-200 shadow-lg">
                    {availableFloors.map((floor) => (
                      <SelectItem
                        key={floor}
                        value={floor.toString()}
                        className="hover:bg-sky-50 focus:bg-sky-50"
                      >
                        Floor {floor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="date"
                  className="text-sm font-medium text-black flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-sky-500" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-10 border border-sky-200 bg-white hover:border-sky-400 hover:shadow-md hover:shadow-sky-100/50 transition-all duration-200 focus:ring-2 focus:ring-sky-200"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="time"
                  className="text-sm font-medium text-black flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-sky-500" />
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="h-10 border border-sky-200 bg-white hover:border-sky-400 hover:shadow-md hover:shadow-sky-100/50 transition-all duration-200 focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
          <CardHeader className="pb-6 border-b border-sky-100">
            <CardTitle className="text-xl font-semibold text-black flex items-center gap-2">
              <BuildingIcon className="w-5 h-5 text-sky-500" />
              {currentBuilding?.name} • Floor {selectedFloor}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {filteredRooms.length > 0 ? (
              <div className="space-y-8">
                {filteredRooms.some((room) => room.block === "A") && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-black border-b border-sky-200 pb-2">
                      Block A
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                          <Presentation className="w-4 h-4 text-sky-500" />
                          Lecture Halls
                        </h4>
                        <div className="flex flex-wrap justify-center gap-4">
                          {filteredRooms
                            .filter(
                              (room) =>
                                room.block === "A" &&
                                room.type === "lecture-hall"
                            )
                            .map((room) => (
                              <RoomCard key={room.id} room={room} />
                            ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                          <FlaskConical className="w-4 h-4 text-sky-500" />
                          Laboratories
                        </h4>
                        <div className="flex flex-wrap justify-center gap-4">
                          {filteredRooms
                            .filter(
                              (room) =>
                                room.block === "A" && room.type === "lab"
                            )
                            .map((room) => (
                              <RoomCard key={room.id} room={room} />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {filteredRooms.some((room) => room.block === "B") && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-black border-b border-sky-200 pb-2">
                      Block B
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                          <Presentation className="w-4 h-4 text-sky-500" />
                          Lecture Halls
                        </h4>
                        <div className="flex flex-wrap justify-center gap-4">
                          {filteredRooms
                            .filter(
                              (room) =>
                                room.block === "B" &&
                                room.type === "lecture-hall"
                            )
                            .map((room) => (
                              <RoomCard key={room.id} room={room} />
                            ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                          <FlaskConical className="w-4 h-4 text-sky-500" />
                          Laboratories
                        </h4>
                        <div className="flex flex-wrap justify-center gap-4">
                          {filteredRooms
                            .filter(
                              (room) =>
                                room.block === "B" && room.type === "lab"
                            )
                            .map((room) => (
                              <RoomCard key={room.id} room={room} />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-6 pt-6 border-t border-sky-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-sky-500" />
                    <span className="text-sm text-gray-700">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Reserved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-gray-700">Maintenance</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <div className="text-lg font-medium mb-2">
                  No rooms available
                </div>
                <div className="text-sm">Try selecting a different floor</div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedRoom && (
          <Dialog
            open={!!selectedRoom}
            onOpenChange={() => setSelectedRoom(null)}
          >
            <DialogContent className="sm:max-w-lg bg-white border border-sky-200 shadow-xl">
              <DialogHeader className="border-b border-sky-100 pb-4">
                <DialogTitle className="text-xl font-semibold text-black flex items-center gap-2">
                  {selectedRoom.type === "lecture-hall" ? (
                    <Presentation className="w-5 h-5 text-sky-500" />
                  ) : (
                    <FlaskConical className="w-5 h-5 text-sky-500" />
                  )}
                  Book {selectedRoom.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1 p-3 bg-sky-50 rounded-lg border border-sky-200">
                    <span className="text-gray-600 font-medium">Type</span>
                    <div className="font-semibold text-black">
                      {selectedRoom.type === "lecture-hall"
                        ? "Lecture Hall"
                        : "Laboratory"}
                    </div>
                  </div>
                  <div className="space-y-1 p-3 bg-sky-50 rounded-lg border border-sky-200">
                    <span className="text-gray-600 font-medium">Capacity</span>
                    <div className="font-semibold text-black flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {selectedRoom.capacity} seats
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-gray-600 font-medium text-sm">
                    Equipment
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.equipment.map((item) => (
                      <Badge
                        key={item}
                        variant="outline"
                        className="text-sm bg-sky-50 text-black border-sky-200"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-sky-100 space-y-4">
                  <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                    <p className="font-semibold text-black flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-sky-500" />
                      {new Date(selectedDate).toLocaleDateString()} at{" "}
                      {new Date(
                        `2000-01-01T${selectedTime}`
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={handleBookRoom}
                      className="px-8 py-3 h-12 font-semibold text-lg bg-sky-500 hover:bg-sky-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      Confirm Booking
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRoom(null)}
                      className="px-8 py-3 h-12 font-semibold text-lg border-2 border-sky-500 text-sky-600 hover:bg-sky-50 hover:border-sky-600 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
