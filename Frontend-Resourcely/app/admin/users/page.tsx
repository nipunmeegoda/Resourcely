// app/admin/users/page.tsx
"use client";

import React, { useState } from "react";
import UserListClient from "./components/UserListClient";
import RefreshButton from "./components/RefreshButton";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Users, UserSquare2 } from "lucide-react";

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
                                Tab 2
                            </TabsTrigger>
                            <TabsTrigger value="tab3" className="flex items-center gap-2">
                                <UserSquare2 className="h-4 w-4" />
                                Tab 3
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab 1: Reuses your existing table */}
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

                        {/* Tab 2: Placeholder content */}
                        <TabsContent value="tab2" className="space-y-4 p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tab 2 Content</CardTitle>
                                    <CardDescription>
                                        Replace this with your second dataset/component when ready.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600">
                                        This is a placeholder to demonstrate the tabs are working.
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 3: Placeholder content */}
                        <TabsContent value="tab3" className="space-y-4 p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tab 3 Content</CardTitle>
                                    <CardDescription>
                                        Another placeholder—drop in your component later.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600">
                                        Nothing here yet. You can wire this to roles, permissions, etc.
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