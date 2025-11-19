"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/api/api"; // adjust path if needed
import { toast } from "sonner";
import { useAuthUser } from "@/hooks/useAuthUser";

export default function SettingsPage() {
  const user = useAuthUser();
  const userId = user?.id;
  console.log("USER ID:", userId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const { data } = await usersApi.getById(userId);
        setForm((prev) => ({
          ...prev,
          username: data.username,
          email: data.email,
        }));
      } catch (err) {
        toast.error("Failed to load user settings");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Submit update
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {};

      if (form.username) payload.username = form.username;
      if (form.email) payload.email = form.email;
      if (form.password) payload.password = form.password;

      await usersApi.updateUser(userId, payload);
      toast.success("Profile updated successfully!");

      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err: any) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white p-4 md:p-6 lg:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-black">Settings</h1>
          <div className="w-16 h-1 bg-sky-400 mx-auto"></div>
          <p className="text-lg text-gray-700">
            Update your profile information below.
          </p>
        </div>

        {/* Settings Card */}
        <Card className="border-blue-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-sky-700">Profile Information</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Username */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Username</label>
              <Input
                className="mt-1"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <Input
                className="mt-1"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">New Password</label>
              <Input
                className="mt-1"
                type="password"
                value={form.password}
                placeholder="Enter to change password"
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>

            {/* Save button */}
            <Button
              disabled={saving}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white"
              onClick={handleSave}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
