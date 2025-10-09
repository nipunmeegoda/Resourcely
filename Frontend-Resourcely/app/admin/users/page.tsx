
import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import {RefreshCw, Shield} from "lucide-react";
import {Button} from "@/components/ui/button";
import type {Booking, Users} from "@/api/api";


export default function userPage (){



    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-black text-balance">
                            User Management
                        </h1>
                        <div className="w-16 h-1 bg-sky-400 mx-auto"></div>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Review and manage users
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Card className="border border-sky-200 shadow-lg shadow-sky-100/50 bg-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-sky-100 rounded-lg">
                                            <Shield className="h-5 w-5 text-sky-600"/>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                               Total Users
                                            </p>
                                            <p className="text-2xl font-bold text-black">
                                                //length
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Button
                            //onClick=refreshget
                            variant="outline"
                            className="border-sky-200 hover:border-sky-400 hover:bg-sky-50 text-sky-600 hover:text-sky-700 gap-2"
                        >
                            <RefreshCw className="h-4 w-4"/>
                            Refresh
                        </Button>
                    </div>


                </div>
            </div>
        </>
    )
}
