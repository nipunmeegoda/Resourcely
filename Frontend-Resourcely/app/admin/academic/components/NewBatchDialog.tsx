"use client";

import * as React from "react";
import { batchApi } from "@/api/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
    onCreated?: () => void; // call to refresh parent lists after create
    trigger?: React.ReactNode; // optional custom trigger
};

export default function NewBatchDialog({ onCreated, trigger }: Props) {
    const [open, setOpen] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    const [name, setName] = React.useState("");
    const [code, setCode] = React.useState("");
    const [startDate, setStartDate] = React.useState<string>("");
    const [endDate, setEndDate] = React.useState<string>("");

    const reset = () => {
        setName("");
        setCode("");
        setStartDate("");
        setEndDate("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !code.trim()) {
            toast.error("Name and Code are required");
            return;
        }

        setSaving(true);
        try {
            await batchApi.create({
                name: name.trim(),
                code: code.trim(),
                startDate: startDate || null,
                endDate: endDate || null,
            });
            toast.success("Batch created");
            setOpen(false);
            reset();
            onCreated?.();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create batch");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? <Button>Create Batch</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Batch</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Batch Name *</Label>
                        <Input
                            id="name"
                            placeholder='e.g. "2025 - IT"'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={saving}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="code">Batch Code *</Label>
                        <Input
                            id="code"
                            placeholder='e.g. "IT25"'
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            disabled={saving}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="start">Start Date</Label>
                        <Input
                            id="start"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={saving}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="end">End Date</Label>
                        <Input
                            id="end"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            disabled={saving}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
