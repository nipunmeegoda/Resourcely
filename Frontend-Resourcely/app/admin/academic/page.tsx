
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Users, } from "lucide-react";
import NewBatchDialog from "@/app/admin/academic/components/NewBatchDialog";
import {Button} from "@/components/ui/button";
import BatchesList from "@/app/admin/academic/components/BatchList";


export default function AcademicPage() {
    const [activeTab, setActiveTab] = useState<"tab1" | "tab2" >("tab1");

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-black">Batch & Timetable Management </h1>
                    <div className="w-16 h-1 bg-sky-400 mx-auto"></div>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Organize university batches and schedules with ease
                    </p>
                </div>

                {/* Main Card with Tabs */}
                <Card className="w-full border-blue-200 shadow-md">
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as "tab1" | "tab2")}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger
                                value="tab1"
                                className="flex items-center gap-2 data-[state=active]:bg-white "
                            >
                                <Users className="h-4 w-4" />
                                Manage Batch Groups
                            </TabsTrigger>
                            <TabsTrigger
                                value="tab2"
                                className="flex items-center gap-2 data-[state=active]:bg-white "
                            >
                                <Layers className="h-4 w-4" />
                                Academic Scheduler
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab 1: */}
                        <TabsContent value="tab1" className="space-y-4 p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Setup Academic Batch Groups</CardTitle>
                                    <CardDescription>
                                        Assign Newly Registered Students with their batch or modify exiting students
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <NewBatchDialog
                                        onCreated={() => {
                                            // TODO: refresh  batch list / table
                                        }}
                                        // optional: custom trigger styling
                                        trigger={<Button className="bg-sky-600 hover:bg-sky-700">Create New Batch</Button>}
                                    />
                                    <BatchesList />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab 2:  */}
                        <TabsContent value="tab2" className="space-y-4 p-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Manage Academic Time-Tables</CardTitle>
                                    <CardDescription>
                                        Schedule Academic Time-Tables
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-600">
                                   Coming Soon.
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
