"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/api/api";

type User = {
    id: number;
    email: string;
    username: string;
    role: string;
    createdAt?: string;
};

export default function RefreshButton() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await usersApi.getAll();
            setUsers(response.data ?? []);
            console.log("✅ Users loaded:", response.data);
        } catch (error) {
            console.error("❌ Error loading users:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={loadUsers}
                disabled={loading}
                variant="outline"
                className="border-sky-200 hover:border-sky-400 hover:bg-sky-50 text-sky-600 hover:text-sky-700 gap-2"
            >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Refreshing..." : "Refresh"}
            </Button>
        </>
    );
}
