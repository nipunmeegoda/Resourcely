'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { departmentApi } from '@/api/api';

interface AddDepartmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newDept: { id?: number; name: string; description?: string }) => void;
}

const AddDepartmentDialog: React.FC<AddDepartmentDialogProps> = ({ isOpen, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setName('');
    setDescription('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter a department name.');
      return;
    }
    setIsLoading(true);
    try {
      const payload = { name: name.trim(), description: description.trim() || undefined };
      const res = await departmentApi.create(payload);
      toast.success('Department created');
      onCreated?.(res.data ?? payload);
      reset();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error('Failed to create department');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle>Add Department</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
            </div>
          </div>
        </div>
        <DialogFooter className="p-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Department'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDepartmentDialog;
