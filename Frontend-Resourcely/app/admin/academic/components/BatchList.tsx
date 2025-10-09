"use client";

import React, { useEffect, useMemo, useState } from "react";
import { batchApi } from "@/api/api";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

type Batch = {
    id: number;
    name: string;
    code: string;
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
    createdAt?: string;
};

type Row = Batch & { studentCount: number };

type SortOrder = "none" | "active-first" | "inactive-first";

const fmt = (d?: string | null) =>
    d
        ? new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
        }).format(new Date(d))
        : "—";

const toDateInput = (d?: string | null) =>
    d ? new Date(d).toISOString().slice(0, 10) : "";


export default function BatchesList() {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<Record<number, boolean>>({});
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Batch | null>(null);
    const [editSaving, setEditSaving] = useState(false);

    // NEW: search & sort states
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<SortOrder>("none");

    const load = async () => {
        setLoading(true);
        try {
            const res = await batchApi.getAll();
            const batches: Batch[] = (res.data ?? []).sort((a: Batch, b: Batch) =>
                String(a.name).localeCompare(String(b.name))
            );

            // Fetch student counts concurrently
            const counts = await Promise.all(
                batches.map(async (b) => {
                    try {
                        const resStudents = await batchApi.getStudents(b.id);
                        return Array.isArray(resStudents.data) ? resStudents.data.length : 0;
                    } catch {
                        return 0;
                    }
                })
            );

            const withCounts: Row[] = batches.map((b, i) => ({ ...b, studentCount: counts[i] ?? 0 }));
            setRows(withCounts);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load batches");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const totalStudents = useMemo(
        () => rows.reduce((acc, r) => acc + r.studentCount, 0),
        [rows]
    );

    // ---------- filtering + sorting ----------
    const filteredAndSortedRows = useMemo(() => {
        const q = search.trim().toLowerCase();

        let list = rows.filter((r) => (q ? r.name.toLowerCase().includes(q) : true));

        if (sortOrder === "active-first") {
            list = [...list].sort((a, b) => Number(b.isActive) - Number(a.isActive));
        } else if (sortOrder === "inactive-first") {
            list = [...list].sort((a, b) => Number(a.isActive) - Number(b.isActive));
        }

        return list;
    }, [rows, search, sortOrder]);

    // ---------- Delete ----------
    const handleDelete = async (row: Row) => {
        if (!confirm(`Delete batch "${row.name}"? This cannot be undone.`)) return;
        setBusy((b) => ({ ...b, [row.id]: true }));
        try {
            await batchApi.remove(row.id);
            toast.success(`Batch "${row.name}" deleted`);
            await load();
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete batch");
        } finally {
            setBusy((b) => ({ ...b, [row.id]: false }));
        }
    };

    const openEdit = (row: Row) => {
        setEditing({
            id: row.id,
            name: row.name,
            code: row.code,
            startDate: toDateInput(row.startDate), // ← normalize to YYYY-MM-DD
            endDate: toDateInput(row.endDate),     // ← normalize to YYYY-MM-DD
            isActive: row.isActive ?? true,
        });
        setEditOpen(true);
    };


    const saveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setEditSaving(true);
        try {
            await batchApi.update(editing.id, {
                name: editing.name,
                code: editing.code,
                startDate: editing.startDate ? editing.startDate : null, // ← null if empty
                endDate: editing.endDate ? editing.endDate : null,       // ← null if empty
                isActive: editing.isActive ?? true,
            });
            toast.success("Batch updated");
            setEditOpen(false);
            await load();
        } catch (e) {
            console.error(e);
            toast.error("Failed to update batch");
        } finally {
            setEditSaving(false);
        }
    };


    if (loading) {
        return (
            <div className="p-6 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading batches...</span>
            </div>
        );
    }

    return (
        <>
            <div className="w-full">
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between my-5">
                    <div className="space-y-1">
                        <CardTitle className="text-xl -mx-5">All Batches</CardTitle>
                        <div className="text-sm text-gray-600 flex items-center gap-2 -mx-5">
                            <Users className="h-4 w-4" />
                            Total students across batches:{" "}
                            <span className="font-medium">{totalStudents}</span>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                className="pl-8 w-[240px]"
                                placeholder="Search by batch name…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Sort */}
                        <Select value={sortOrder} onValueChange={(v: SortOrder) => setSortOrder(v)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No sorting</SelectItem>
                                <SelectItem value="active-first">Active first</SelectItem>
                                <SelectItem value="inactive-first">Inactive first</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={() => { void load(); }}>
                            Refresh
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border text-sm">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">Batch Name</th>
                                <th className="p-2 text-left">Code</th>
                                <th className="p-2 text-left">Start</th>
                                <th className="p-2 text-left">End</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Students</th>
                                <th className="p-2 text-left">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAndSortedRows.map((r) => {
                                const isBusy = !!busy[r.id];
                                return (
                                    <tr key={r.id} className="border-t hover:bg-gray-50">
                                        <td className="p-2 font-medium">{r.name}</td>
                                        <td className="p-2">{r.code}</td>
                                        <td className="p-2">{fmt(r.startDate)}</td>
                                        <td className="p-2">{fmt(r.endDate)}</td>
                                        <td className="p-2">
                                            {r.isActive ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Button variant="destructive" size="sm" disabled>
                                                    Inactive
                                                </Button>
                                            )}
                                        </td>
                                        <td className="p-2">{r.studentCount}</td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEdit(r)}
                                                    disabled={isBusy}
                                                >
                                                    <Pencil className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(r)}
                                                    disabled={isBusy}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    {isBusy ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredAndSortedRows.length === 0 && (
                                <tr>
                                    <td className="p-4 text-center text-gray-500" colSpan={7}>
                                        No batches match your search.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Batch</DialogTitle>
                    </DialogHeader>

                    {editing && (
                        <form onSubmit={saveEdit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="bname">Batch Name</Label>
                                <Input
                                    id="bname"
                                    value={editing.name}
                                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                    disabled={editSaving}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bcode">Batch Code</Label>
                                <Input
                                    id="bcode"
                                    value={editing.code}
                                    onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                                    disabled={editSaving}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bstart">Start Date</Label>
                                <Input
                                    id="bstart"
                                    type="date"
                                    value={editing.startDate ?? ""}
                                    onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                                    disabled={editSaving}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="bend">End Date</Label>
                                <Input
                                    id="bend"
                                    type="date"
                                    value={editing.endDate ?? ""}
                                    onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                                    disabled={editSaving}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="bactive" className="mr-3">
                                    Active
                                </Label>
                                <Switch
                                    id="bactive"
                                    checked={!!editing.isActive}
                                    onCheckedChange={(v: boolean) => setEditing({ ...editing, isActive: v })}
                                    disabled={editSaving}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setEditOpen(false)}
                                    disabled={editSaving}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editSaving}>
                                    {editSaving ? "Saving..." : "Save changes"}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
