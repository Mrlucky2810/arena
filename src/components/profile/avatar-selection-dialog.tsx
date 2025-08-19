
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { AVATAR_IMAGES } from "@/lib/constants";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AvatarSelectionDialog() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState(userData?.avatarUrl);
  const [open, setOpen] = useState(false);

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  const handleSave = async () => {
    if (!user || !selectedAvatar) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, { avatarUrl: selectedAvatar });
      toast({
        title: "Avatar Updated!",
        description: "Your new avatar has been saved.",
      });
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save your new avatar.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Avatar</DialogTitle>
          <DialogDescription>
            Choose an avatar that represents you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 py-4">
          {AVATAR_IMAGES.map((avatar, index) => (
            <div
              key={index}
              className={cn(
                "relative cursor-pointer rounded-full overflow-hidden border-4 transition-all duration-300",
                selectedAvatar === avatar ? "border-primary" : "border-transparent"
              )}
              onClick={() => handleAvatarSelect(avatar)}
            >
              <Image
                src={avatar}
                alt={`Avatar ${index + 1}`}
                width={100}
                height={100}
                className="aspect-square"
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={!selectedAvatar || selectedAvatar === userData?.avatarUrl}>
          Save Avatar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
