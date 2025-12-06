"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@components/ui/drawer";
import { Plus } from "lucide-react";
import { EmbedSubmitForm } from "./reel-submit-form";

export function EmbedSubmitDrawer({ postedById, onSuccess }) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    onSuccess?.();
    setTimeout(() => setOpen(false), 1000);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Reel
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md pb-8">
          <DrawerHeader>
            <DrawerTitle>Add Reel</DrawerTitle>
            <DrawerDescription>
              Paste a TikTok, Instagram, or YouTube link to add a new reel
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <EmbedSubmitForm
              postedById={postedById}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
