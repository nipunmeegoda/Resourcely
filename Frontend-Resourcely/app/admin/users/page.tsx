// app/admin/users/page.tsx
"use client";

import React, { useState } from "react";
import UserListClient from "./components/UserListClient";



import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Users, UserSquare2 } from "lucide-react";
import StudentManagementList from "@/app/admin/users/components/StudentManagementList";
import LecturerManagementList from "./components/LecturerManagementList";

export default function UsersPage() {
    const [activeTab, setActiveTab] = useState<"tab1" | "tab2" | "tab3">("tab1");

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-black">Manage Users</h1>
                    <div className="w-16 h-1 bg-sky-400 mx-auto"></div>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Review and manage students and lecturers
                    </p>
                </div>

                {/* Main Card with Tabs */}
                <Card className="w-full border-blue-200 shadow-md">
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as "tab1" | "tab2" | "tab3")}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="tab1" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Assign Roles
                            </TabsTrigger>
                            <TabsTrigger value="tab2" className="flex items-center gap-2">
                                <Layers className="h-4 w-4" />
                                Manage Students
                            </TabsTrigger>
                            <TabsTrigger value="tab3" className="flex items-center gap-2">
                                <UserSquare2 className="h-4 w-4" />
                                Manage Lecturers
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab 1: */}
                        <TabsContent value="tab1" className="space-y-4 p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assign Current Users with Roles</CardTitle>
                                    <CardDescription>List of users currently using Resourcely</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto w-full">
                                        <UserListClient />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 2:  */}
                        <TabsContent value="tab2" className="space-y-4 p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Manage Students</CardTitle>
                                    <CardDescription>
                                        Assign Newly Registered Students with their batch or modify exiting students
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600">
                                       <StudentManagementList />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 3:  */}
                        <TabsContent value="tab3" className="space-y-4 p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Manage Lecturers</CardTitle>
                                    <CardDescription>
                                        Manage Lecturers and assign their departments
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600">
                                        <LecturerManagementList />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
