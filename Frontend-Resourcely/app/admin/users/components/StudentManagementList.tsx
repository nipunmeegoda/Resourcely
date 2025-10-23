"use client";

import React, { useEffect, useState } from "react";
import { usersApi, batchApi } from "@/api/api";
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

type Student = {
    id: number;
    email: string;
    username: string;
    role: string; // "Student"
    batch?: {
        batchId: number;
        batchName: string;
        batchCode: string;
    } | null;
};

type Batch = {
    id: number;
    name: string; // e.g., "2025 - IT"
    code: string; // e.g., "IT25"
    isActive?: boolean;
};

type BatchFilterValue = "ALL" | "NONE" | `${number}`;

type BatchStudentRow = {
    userId: number;
    username: string;
    email: string;
    role?: string;
    batchId: number;
    batchName: string;
    batchCode: string;
};

const StudentManagementList: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<Record<number, boolean>>({});
    const [saving, setSaving] = useState<Record<number, boolean>>({});
    const [batchFilter, setBatchFilter] = useState<BatchFilterValue>("ALL");

    // ---------- helpers ----------
    const mapBatchStudentsToStudents = (
        rows: {
            userId: number;
            username: string;
            email: string;
            role: string;
            batchId: number;
            batchName: string;
            batchCode: string;
        }[]
    ): Student[] =>
        (rows ?? []).map((x) => ({
            id: x.userId,
            username: x.username,
            email: x.email,
            role: x.role ?? "Student",
            batch: {
                batchId: x.batchId,
                batchName: x.batchName,
                batchCode: x.batchCode,
            },
        }));

    const loadAllBatches = async () => {
        const res = await batchApi.getAll();
        const list: Batch[] = (res.data ?? []).sort((a: Batch, b: Batch) =>
            String(a.name).localeCompare(String(b.name))
        );
        setBatches(list);
    };

    const loadStudentsAll = async () => {
        const res = await usersApi.getAllRoleStudent();
        setStudents(res.data ?? []);
    };

    const loadStudentsNoBatch = async () => {
        const res = await usersApi.getAllRoleStudent();
        const list: Student[] = (res.data ?? []).filter((s: Student) => !s.batch);
        setStudents(list);
    };

    const loadStudentsForBatch = async (batchId: number) => {
        const res = await batchApi.getStudents(batchId);
        setStudents(mapBatchStudentsToStudents((res.data ?? []) as BatchStudentRow[]));
    };

    const loadForCurrentFilter = async () => {
        setLoading(true);
        try {
            if (batches.length === 0) await loadAllBatches();
            if (batchFilter === "ALL") await loadStudentsAll();
            else if (batchFilter === "NONE") await loadStudentsNoBatch();
            else await loadStudentsForBatch(Number(batchFilter));
        } catch (e) {
            console.error(e);
            toast.error("Failed to load students or batches");
        } finally {
            setLoading(false);
        }
    };

    // initial load
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                await Promise.all([loadAllBatches(), loadStudentsAll()]);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load students or batches");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // reload when filter changes
    useEffect(() => {
        if (!loading) void loadForCurrentFilter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batchFilter]);

    // ---------- actions ----------
    const handleDeleteStudent = async (userId: number) => {
        const user = students.find((s) => s.id === userId);
        if (!user) return;
        if (!confirm(`Delete student "${user.username}"?`)) return;

        setDeleting((d) => ({ ...d, [userId]: true }));
        try {
            await usersApi.deleteUser(userId);
            setStudents((prev) => prev.filter((s) => s.id !== userId));
            toast.success(`"${user.username}" deleted`);
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete student");
        } finally {
            setDeleting((d) => ({ ...d, [userId]: false }));
        }
    };

    const handleBatchChange = async (user: Student, value: string) => {
        // value can be "NONE" (remove) or a batchId string
        const userId = user.id;
        setSaving((s) => ({ ...s, [userId]: true }));

        // optimistic UI update
        const prev = students;
        const next = students.map((s) =>
            s.id !== userId
                ? s
                : value === "NONE"
                    ? { ...s, batch: null }
                    : {
                        ...s,
                        batch: {
                            batchId: Number(value),
                            batchName: batches.find((b) => b.id === Number(value))?.name ?? "",
                            batchCode: batches.find((b) => b.id === Number(value))?.code ?? "",
                        },
                    }
        );
        setStudents(next);

        try {
            if (value === "NONE") {
                await usersApi.removeBatch(userId);
                toast.success(`Removed batch from ${user.username}`);
            } else {
                await usersApi.assignBatch(userId, Number(value));
                toast.success(`Assigned ${user.username} to batch ${value}`);
            }
            // refresh to reflect current filter (student may move in/out)
            await loadForCurrentFilter();
        } catch (e) {
            console.error(e);
            setStudents(prev); // revert on error
            toast.error("Failed to update batch");
        } finally {
            setSaving((s) => ({ ...s, [userId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading students...</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Toolbar */}
            <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Batch filter:</span>
                    <Select
                        value={batchFilter}
                        onValueChange={(val: BatchFilterValue) => setBatchFilter(val)}
                    >
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All</SelectItem>
                            <SelectItem value="NONE">No batch</SelectItem>
                            {batches.map((b) => (
                                <SelectItem key={b.id} value={`${b.id}`}>
                                    {b.name} ({b.code})
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
                    <th className="p-2 text-left">Batch</th>
                    <th className="p-2 text-left">Actions</th>
                </tr>
                </thead>
                <tbody>
                {students.map((s) => {
                    const isDeleting = !!deleting[s.id];
                    const isSaving = !!saving[s.id];
                    const currentVal: BatchFilterValue =
                        s.batch?.batchId != null ? `${s.batch.batchId}` : "NONE";

                    return (
                        <tr key={s.id} className="border-t hover:bg-gray-50">
                            <td className="p-2">{s.username}</td>
                            <td className="p-2">{s.email}</td>
                            <td className="p-2">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={currentVal}
                                        disabled={isSaving || isDeleting}
                                        onValueChange={(val) => handleBatchChange(s, val)}
                                    >
                                        <SelectTrigger className="w-[260px]">
                                            <SelectValue placeholder="Select batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NONE">No batch</SelectItem>
                                            {batches.map((b) => (
                                                <SelectItem key={b.id} value={`${b.id}`}>
                                                    {b.name} ({b.code})
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
                                    onClick={() => handleDeleteStudent(s.id)}
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
                {students.length === 0 && (
                    <tr>
                        <td className="p-4 text-center text-gray-500" colSpan={4}>
                            No students found for the selected batch.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default StudentManagementList;
