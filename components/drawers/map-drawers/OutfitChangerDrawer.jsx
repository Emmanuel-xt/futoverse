"use client";

import { useState } from "react";
import { Shirt, X, User, Users } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@components/ui/drawer";
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { ScrollArea } from "@components/ui/scroll-area";
import { cn } from "@lib/utils";

// interface OutfitChangerDrawerProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
// }

// Mock avatar data
const AVATAR_DATA = {
  boys: [
    {
      id: 1,
      name: "Alex",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      id: 2,
      name: "Ben",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
    },
  ],
  girls: [
    {
      id: 1,
      name: "Alice",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      id: 2,
      name: "Bella",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
    },
  ],
};

export const OutfitChangerDrawer = ({ open, onOpenChange }) => {
  const [selectedGender, setSelectedGender] = useState("boys");
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
  };

  const handleSaveAvatar = () => {
    if (selectedAvatar) {
      // Here you would typically save the avatar selection to your backend/state
      console.log(`Selected avatar: ${selectedGender} - ${selectedAvatar}`);
      onOpenChange(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[60vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Shirt className="h-6 w-6" />
              </div>
              <DrawerTitle className="text-xl font-semibold">
                Choose Your Model
              </DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="p-6">
          {/* Gender Selection */}
          <div className="flex gap-4 mb-6">
            <Button
              variant={selectedGender === "boys" ? "default" : "outline"}
              onClick={() => setSelectedGender("boys")}
              className="flex items-center gap-2 flex-1"
            >
              <User className="h-4 w-4" />
              Male
            </Button>
            <Button
              variant={selectedGender === "girls" ? "default" : "outline"}
              onClick={() => setSelectedGender("girls")}
              className="flex items-center gap-2 flex-1"
            >
              <Users className="h-4 w-4" />
              Female
            </Button>
          </div>

          {/* Avatar Grid */}
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-3 gap-4 pb-4">
              {AVATAR_DATA[selectedGender].map((avatar) => (
                <div
                  key={avatar.id}
                  className={cn(
                    "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                    selectedAvatar === avatar.id
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => handleAvatarSelect(avatar.id)}
                >
                  <img
                    src={avatar.image || "/placeholder.svg"}
                    alt={avatar.name}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      const target = e.target;
                      target.src = "/placeholder.svg?height=128&width=128";
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                    <p className="text-sm font-medium text-center">
                      {avatar.name}
                    </p>
                  </div>
                  {selectedAvatar === avatar.id && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-blue-500 text-white">Selected</Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAvatar}
              disabled={!selectedAvatar}
              className="flex-1"
            >
              Save Avatar
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
