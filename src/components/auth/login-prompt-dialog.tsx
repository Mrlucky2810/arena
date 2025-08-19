
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "lucide-react";

interface LoginPromptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LoginPromptDialog({ open, onOpenChange }: LoginPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl pt-2">Authentication Required</DialogTitle>
          <DialogDescription>
            You need to be logged in to perform this action. Please log in or create an account to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
            <Link href="/login" className="w-full">
                <Button className="w-full" size="lg">Log In</Button>
            </Link>
            <Link href="/register" className="w-full">
                <Button variant="outline" className="w-full" size="lg">Create Account</Button>
            </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
