"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, Layers, RefreshCw } from "lucide-react";
import { RoomCard } from "./RoomCard"; // ✅ Reuse your existing RoomCard component

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Types
type Resource = {
    id: number;
    name: string;
    type: string;
    description?: string;
    capacity: number;
    blockId: number;
    isRestricted: boolean;
    restrictedToRoles: string;
    blockName: string;
    floorName: string;
    buildingName: string;
};

type AvailableNowResponse = {
    checkedAtUtc: string;
    count: number;
    resources: Resource[];
};

export default function AvailableNowCard() {
    const [data, setData] = useState<AvailableNowResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
    const [search, setSearch] = useState<string>("");

    // Fetch available resources
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/resources/available-now`, {
                cache: "no-store",
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = (await res.json()) as AvailableNowResponse;
            setData(json);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Failed to load";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Extract buildings for dropdown
    const buildings = useMemo(() => {
        const set = new Set<string>();
        data?.resources.forEach((r) => set.add(r.buildingName));
        return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [data]);

    // Filter + group by Building → Floor
    const groupedResources = useMemo(() => {
        let list = data?.resources ?? [];

        if (selectedBuilding !== "all") {
            list = list.filter((r) => r.buildingName === selectedBuilding);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (r) =>
                    r.name.toLowerCase().includes(q) ||
                    r.type.toLowerCase().includes(q) ||
                    r.floorName.toLowerCase().includes(q) ||
                    r.blockName.toLowerCase().includes(q)
            );
        }

        const grouped: Record<string, Record<string, Resource[]>> = {};
        for (const r of list) {
            if (!grouped[r.buildingName]) grouped[r.buildingName] = {};
            if (!grouped[r.buildingName][r.floorName])
                grouped[r.buildingName][r.floorName] = [];
            grouped[r.buildingName][r.floorName].push(r);
        }
        return grouped;
    }, [data, selectedBuilding, search]);

    const checkedAtLocal = useMemo(() => {
        if (!data?.checkedAtUtc) return "—";
        try {
            const dt = new Date(data.checkedAtUtc);
            return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
        } catch {
            return data.checkedAtUtc;
        }
    }, [data]);

    return (
        <Card className="w-full border-blue-200 shadow-md">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <CardTitle className="text-2xl text-gray-900">
                        Available Now
                    </CardTitle>
                    <CardDescription>
                        Shows all resources currently available, grouped by building and
                        floor.
                    </CardDescription>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Select building" />
                        </SelectTrigger>
                        <SelectContent>
                            {buildings.map((b) => (
                                <SelectItem key={b} value={b}>
                                    {b === "all" ? "All Buildings" : b}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name / floor / block"
                        className="w-[260px]"
                    />

                    <Button variant="outline" onClick={fetchData} disabled={loading}>
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {error && (
                    <div className="text-sm text-red-600 mb-3">
                        Failed to load: {error}
                    </div>
                )}
                {loading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading current
                        availability…
                    </div>
                )}

                {!loading && data && (
                    <div className="space-y-6">
                        {Object.keys(groupedResources).length === 0 ? (
                            <div className="text-sm text-muted-foreground">
                                No resources available right now.
                            </div>
                        ) : (
                            Object.entries(groupedResources)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([building, floors]) => (
                                    <div key={building} className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            <h3 className="font-semibold">{building}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.entries(floors)
                                                .sort(([a], [b]) => a.localeCompare(b))
                                                .map(([floor, resources]) => (
                                                    <div
                                                        key={floor}
                                                        className="rounded-2xl border p-4 bg-white"
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Layers className="h-4 w-4" />
                                                            <h4 className="font-medium">{floor}</h4>
                                                            <Badge
                                                                variant="secondary"
                                                                className="ml-auto text-xs"
                                                            >
                                                                {resources.length} free
                                                            </Badge>
                                                        </div>

                                                        {/* ✅ Reuse RoomCard component for each resource */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {resources
                                                                .sort((a, b) =>
                                                                    a.name.localeCompare(b.name)
                                                                )
                                                                .map((r) => (
                                                                    <RoomCard
                                                                        key={r.id}
                                                                        room={{ ...r, status: "available" }}
                                                                    />
                                                                ))}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))
                        )}

                        <div className="text-xs text-muted-foreground">
                            Last checked (local): {checkedAtLocal}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}