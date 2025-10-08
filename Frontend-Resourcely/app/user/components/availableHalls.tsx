"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AvailableNowCard from "./AvailableNowCard"; // ✅ adjust path if needed

const AvailableHalls = () => {
    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-10">
                <Card className="border-blue-200 bg-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl text-gray-900">
                            Available Lecture Halls
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {/* ✅ Embed the Available Now card here */}
                        <AvailableNowCard />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AvailableHalls;
