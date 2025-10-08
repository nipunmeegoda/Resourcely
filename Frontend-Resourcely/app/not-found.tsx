"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-gray-900 mb-2">
            404
          </CardTitle>
          <CardDescription className="text-xl text-gray-600">
            Page Not Found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-500">
            This page is currently under construction. Please check back later.
          </p>
          <Link href="/" className="w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
              Go Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
