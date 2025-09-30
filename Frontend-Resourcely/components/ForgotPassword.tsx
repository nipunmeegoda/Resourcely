"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordProps {
  open: boolean;
  handleClose: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  open,
  handleClose,
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#04263bae] border-[#07476eae] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Reset password</DialogTitle>
          <DialogDescription className="text-gray-300">
            Enter your account&apos;s email address, and we&apos;ll send you a
            link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email" className="text-white">
              Email address
            </Label>
            <Input
              id="reset-email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              required
              autoFocus
              className="bg-transparent border-white/20 text-white placeholder:text-gray-400 focus:border-white"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#f00b0bb9] hover:bg-[#ff0000ff] text-white"
            >
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPassword;
