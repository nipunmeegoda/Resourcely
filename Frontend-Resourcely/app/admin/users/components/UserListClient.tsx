"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/api/api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type User = {
    id: number;
    email: string;
    username: string;
    role: string;
    createdAt?: string;
};

const ROLE_OPTIONS = ["Admin", "Lecturer", "Student", "User"] as const;
type RoleFilter = "All" | "User" | "Student" | "Lecturer";

export default function UserListClient() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<Record<number, boolean>>({});
    const [deleting, setDeleting] = useState<Record<number, boolean>>({});
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");

    const loadUsersByFilter = async (filter: RoleFilter) => {
        setLoading(true);
        try {
            let response;
            switch (filter) {
                case "User":
                    response = await usersApi.getAllRoleUser();
                    break;
                case "Student":
                    response = await usersApi.getAllRoleStudent();
                    // API returns StudentProfiles with Batch info; normalize if needed
                    break;
                case "Lecturer":
                    response = await usersApi.getAllRoleLecturer();
                    break;
                case "All":
                default:
                    response = await usersApi.getAll(); // returns all users except Admin
                    break;
            }
            setUsers(response.data ?? []);
        } catch (error) {
            console.error("Error loading users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => loadUsersByFilter(roleFilter);

    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleFilter]);

    const handleRoleChange = async (userId: number, newRole: string) => {
        const prev = users;
        const next = users.map((u) =>
            u.id === userId ? { ...u, role: newRole } : u
        );
        setUsers(next);
        setSaving((s) => ({ ...s, [userId]: true }));

        try {
            await usersApi.updateRole(userId, newRole);
            toast.success(`Role updated for ${userId} → ${newRole}`);
            // Refresh current filtered list so the item moves in/out if needed
            await loadUsers();
        } catch (err) {
            console.error("Failed to update role:", err);
            setUsers(prev); // revert on error
            toast.error("Failed to update role");
        } finally {
            setSaving((s) => ({ ...s, [userId]: false }));
        }
    };

    const handleDeleteUser = async (userId: number) => {
        const user = users.find((u) => u.id === userId);
        if (!user) return;

        if (!confirm(`Are you sure you want to delete "${user.username}"?`)) return;

        setDeleting((d) => ({ ...d, [userId]: true }));

        try {
            await usersApi.deleteUser(userId);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            toast.success(`User "${user.username}" deleted successfully`);
        } catch (err) {
            console.error("Failed to delete user:", err);
            toast.error("Failed to delete user");
        } finally {
            setDeleting((d) => ({ ...d, [userId]: false }));
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading users...</span>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Toolbar */}
            <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Role filter:</span>
                    <Select
                        value={roleFilter}
                        onValueChange={(val: RoleFilter) => setRoleFilter(val)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Lecturer">Lecturer</SelectItem>
                            <SelectItem value="User">Not Assigned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button variant="outline" onClick={loadUsers}>
                    Refresh
                </Button>
            </div>

            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="p-2 text-left">Username</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left">Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((u) => {
                    const isSaving = !!saving[u.id];
                    const isDeleting = !!deleting[u.id];
                    return (
                        <tr key={u.id} className="border-t hover:bg-gray-50">
                            <td className="p-2">{u.username}</td>
                            <td className="p-2">{u.email}</td>
                            <td className="p-2">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={u.role}
                                        disabled={isSaving || isDeleting}
                                        onValueChange={(val) => handleRoleChange(u.id, val)}
                                    >
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLE_OPTIONS.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role}
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
                                    onClick={() => handleDeleteUser(u.id)}
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
                {users.length === 0 && (
                    <tr>
                        <td className="p-4 text-center text-gray-500" colSpan={4}>
                            No users found for the selected role.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}