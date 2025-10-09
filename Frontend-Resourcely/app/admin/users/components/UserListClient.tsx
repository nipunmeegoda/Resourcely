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
import { Loader2 } from "lucide-react";

type User = {
    id: number;
    email: string;
    username: string;
    role: string;
    createdAt?: string;
};

const ROLE_OPTIONS = ["Admin", "Lecturer", "Student", "User"] as const; // adjust to your backend enums

export default function UserListClient() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<Record<number, boolean>>({}); // per-row saving

    const loadUsers = async () => {
        try {
            const response = await usersApi.getAll(); // GET /api/user
            setUsers(response.data ?? []);
        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        // optimistic UI
        const prev = users;
        const next = users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
        setUsers(next);
        setSaving((s) => ({ ...s, [userId]: true }));

        try {
            await usersApi.updateRole(userId, newRole); // PUT /api/user/:id/role { role }
            console.log(`✅ Role updated for user ${userId} -> ${newRole}`);
        } catch (err) {
            console.error("❌ Failed to update role:", err);
            setUsers(prev); // revert on error
        } finally {
            setSaving((s) => ({ ...s, [userId]: false }));
        }
    };

    if (loading) return <div className="p-6">Loading users...</div>;

    return (
        <div className="p-6">
            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="p-2 text-left">Username</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Role</th>
                </tr>
                </thead>
                <tbody>
                {users.map((u) => {
                    const isSaving = !!saving[u.id];
                    return (
                        <tr key={u.id} className="border-t hover:bg-gray-50">
                            <td className="p-2">{u.username}</td>
                            <td className="p-2">{u.email}</td>
                            <td className="p-2">
                                <div className="flex items-center gap-2">
                                    <Select
                                        value={u.role}
                                        disabled={isSaving}
                                        onValueChange={(val) => handleRoleChange(u.id, val)}
                                    >
                                        <SelectTrigger className="w-[180px]">
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
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}
