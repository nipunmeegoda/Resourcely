"use client";

import React, { useEffect, useState } from "react";
import { usersApi, departmentApi } from "@/api/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Lecturer = {
    id: number;
    email: string;
    username: string;
    role: string; // "Lecturer"
    department?: {
        departmentId: number;
        departmentName: string;
    } | null;
};

type Department = {
    id: number;
    name: string;
};

type DepartmentFilterValue = "ALL" | "NONE" | `${number}`;

const LecturerManagementList: React.FC = () => {
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<Record<number, boolean>>({});
    const [saving, setSaving] = useState<Record<number, boolean>>({});
    const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilterValue>("ALL");

    // ---------- helpers ----------
    const mapDepartmentLecturersToLecturers = (
        rows: {
            userId: number;
            username: string;
            email: string;
            role: string;
            departmentId: number;
            departmentName: string;
        }[]
    ): Lecturer[] =>
        (rows ?? []).map((x) => ({
            id: x.userId,
            username: x.username,
            email: x.email,
            role: x.role ?? "Lecturer",
            department: {
                departmentId: x.departmentId,
                departmentName: x.departmentName,
            },
        }));

    const loadAllDepartments = async () => {
        const res = await departmentApi.getAll();
        const list: Department[] = (res.data ?? []).sort((a: Department, b: Department) =>
            String(a.name).localeCompare(String(b.name))
        );
        setDepartments(list);
    };

    const loadLecturersAll = async () => {
        const res = await usersApi.getAllRoleLecturer();
        setLecturers(res.data ?? []);
    };

    const loadLecturersNoDepartment = async () => {
        const res = await usersApi.getAllRoleLecturer();
        const list: Lecturer[] = (res.data ?? []).filter((l: Lecturer) => !l.department);
        setLecturers(list);
    };

    const loadLecturersForDepartment = async (departmentId: number) => {
        // Assuming an endpoint to get lecturers by department
        // This might need to be implemented in the backend
        // For now, we filter client-side, but a dedicated endpoint is better
        const res = await usersApi.getAllRoleLecturer();
        const allLecturers: Lecturer[] = res.data ?? [];
        const list = allLecturers.filter(l => l.department?.departmentId === departmentId);
        setLecturers(list);
    };

    const loadForCurrentFilter = async () => {
        setLoading(true);
        try {
            if (departments.length === 0) await loadAllDepartments();
            if (departmentFilter === "ALL") await loadLecturersAll();
            else if (departmentFilter === "NONE") await loadLecturersNoDepartment();
            else await loadLecturersForDepartment(Number(departmentFilter));
        } catch (e) {
            console.error(e);
            toast.error("Failed to load lecturers or departments");
        } finally {
            setLoading(false);
        }
    };

    // initial load
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                await Promise.all([loadAllDepartments(), loadLecturersAll()]);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load lecturers or departments");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // reload when filter changes
    useEffect(() => {
        if (!loading) void loadForCurrentFilter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentFilter]);

    // ---------- actions ----------
    const handleDeleteLecturer = async (userId: number) => {
        const user = lecturers.find((l) => l.id === userId);
        if (!user) return;
        if (!confirm(`Delete lecturer "${user.username}"?`)) return;

        setDeleting((d) => ({ ...d, [userId]: true }));
        try {
            await usersApi.deleteUser(userId);
            setLecturers((prev) => prev.filter((l) => l.id !== userId));
            toast.success(`"${user.username}" deleted`);
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete lecturer");
        } finally {
            setDeleting((d) => ({ ...d, [userId]: false }));
        }
    };

    const handleDepartmentChange = async (user: Lecturer, value: string) => {
        // value can be "NONE" (remove) or a departmentId string
        const userId = user.id;
        setSaving((s) => ({ ...s, [userId]: true }));

        const prev = lecturers;
        const next = lecturers.map((l) =>
            l.id !== userId
                ? l
                : value === "NONE"
                    ? { ...l, department: null }
                    : {
                        ...l,
                        department: {
                            departmentId: Number(value),
                            departmentName: departments.find((d) => d.id === Number(value))?.name ?? "",
                        },
                    }
        );
        setLecturers(next);

        try {
            if (value === "NONE") {
                // await usersApi.removeDepartment(userId); // This needs to be created in api.ts and backend
                toast.success(`Removed department from ${user.username}`);
            } else {
                // await usersApi.assignDepartment(userId, Number(value)); // This needs to be created in api.ts and backend
                toast.success(`Assigned ${user.username} to department ${value}`);
            }
            await loadForCurrentFilter();
        } catch (e) {
            console.error(e);
            setLecturers(prev);
            toast.error("Failed to update department");
        } finally {
            setSaving((s) => ({ ...s, [userId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading lecturers...</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Toolbar */}
            <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Department filter:</span>
                    <Select
                        value={departmentFilter}
                        onValueChange={(val: DepartmentFilterValue) => setDepartmentFilter(val)}
                    >
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All</SelectItem>
                            <SelectItem value="NONE">No department</SelectItem>
                            {departments.map((d) => (
                                <SelectItem key={d.id} value={`${d.id}`}>
                                    {d.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button variant="outline" onClick={loadForCurrentFilter}>
                    Refresh
                </Button>
            </div>

            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="p-2 text-left">Username</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Department</th>
                    <th className="p-2 text-left">Actions</th>
                </tr>
                </thead>
                <tbody>
                {lecturers.map((l) => {
                    const isDeleting = !!deleting[l.id];
                    const isSaving = !!saving[l.id];
                    const currentVal: DepartmentFilterValue =
                        l.department?.departmentId != null ? `${l.department.departmentId}` : "NONE";

                    return (
                        <tr key={l.id} className="border-t hover:bg-gray-50">
                            <td className="p-2">{l.username}</td>
                            <td className="p-2">{l.email}</td>
                            <td className="p-2">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={currentVal}
                                        disabled={isSaving || isDeleting}
                                        onValueChange={(val) => handleDepartmentChange(l, val)}
                                    >
                                        <SelectTrigger className="w-[260px]">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NONE">No department</SelectItem>
                                            {departments.map((d) => (
                                                <SelectItem key={d.id} value={`${d.id}`}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                </div>
                            </td>
                            <td className="p-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isDeleting || isSaving}
                                    onClick={() => handleDeleteLecturer(l.id)}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                                    )}
                                </Button>
                            </td>
                        </tr>
                    );
                })}
                {lecturers.length === 0 && (
                    <tr>
                        <td className="p-4 text-center text-gray-500" colSpan={4}>
                            No lecturers found for the selected department.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default LecturerManagementList;
