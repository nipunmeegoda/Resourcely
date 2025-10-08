import React from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
const AvailableHalls = () => {
    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-10">
                {/* Quick Stats */}
                <Card className="border-blue-200 bg-white shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-2xl text-gray-900">
                            Available Lecture Halls
                        </CardTitle>

                    </CardHeader>
                    <CardContent>

                    </CardContent>
                </Card>

            </div>
        </div>
            )
            }
            export default AvailableHalls
