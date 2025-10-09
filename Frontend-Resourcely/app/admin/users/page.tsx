// app/admin/users/page.tsx
import UserListClient from "./components/UserListClient";
import React from "react";
import {RefreshCw} from "lucide-react";
import {Button} from "@/components/ui/button";
import RefreshButton from "./components/RefreshButton";
import {Card, CardContent, CardHeader} from "@/components/ui/card";

export default function UsersPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-black">
                        Manage Users
                    </h1>
                    <div className="w-16 h-1 bg-sky-400 mx-auto"></div>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Review and manage students and lecturers
                    </p>
                </div>
                <div className="flex justify-end items-center p-4  bg-sky-50/30 rounded-t-md">
                    <RefreshButton/>
                </div>

                {/* User Management Card */}
                <Card className="w-full border-blue-200 shadow-md">
                    {/* Top bar with Refresh Button */}


                    {/* Table Area */}
                    <CardHeader className="p-0">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto w-full">
                                <UserListClient/>
                            </div>
                        </CardContent>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
