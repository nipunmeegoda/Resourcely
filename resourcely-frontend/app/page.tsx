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

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Resourcely
          </CardTitle>
          <CardDescription className="text-gray-600">
            Manage and book resources efficiently
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link href="/login" className="w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg">
              Login
            </Button>
          </Link>
          <Link href="/signup" className="w-full">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg">
              Register
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
