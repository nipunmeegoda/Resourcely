"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type RoomStatus = "available" | "reserved" | "maintenance";

export type ResourceItem = {
    id: number;
    name: string;
    type: string;
    description?: string;
    capacity: number;
    blockName: string;
    floorName: string;
    buildingName: string;
    isRestricted: boolean;
    status?: RoomStatus; // optional for compatibility
};

export const RoomCard = ({ room }: { room: ResourceItem }) => {
    // determine current status color scheme
    const getStatusStyles = (status: RoomStatus = "available") => {
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

    const styles = getStatusStyles(room.status || "available");

    return (
        <Card
            className={`flex flex-col justify-between p-4 transition-all border ${styles.bg} ${styles.border} rounded-2xl`}
        >
            <div className="space-y-1">
                <div className={`text-lg font-semibold ${styles.text}`}>{room.name}</div>
                <div className="text-xs text-muted-foreground">
                    Block:{" "}
                    {room.blockName}
                </div>
                <div className="text-xs text-muted-foreground">
                    Type: {room.type} | Capacity: {room.capacity}
                </div>
                {room.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">{room.description}</p>
                )}
            </div>
            <div className="flex justify-between items-center mt-3">
                <Badge variant="outline" className={`${styles.badge}`}>
                    {room.status ? room.status.toUpperCase() : "AVAILABLE"}
                </Badge>
                {room.isRestricted && (
                    <Badge variant="destructive" className="ml-2">
                        Restricted
                    </Badge>
                )}
            </div>
        </Card>
    );
};
