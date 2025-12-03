"use client";

import { useState } from "react";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { Plus } from "lucide-react";
import { EmbedSubmitForm } from "./reel-submit-form";

export function EmbedSubmitModal({ postedById, onSuccess }) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    onSuccess?.();
    // Close modal after short delay to show success message
    setTimeout(() => setOpen(false), 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Reel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Reel</DialogTitle>
          <DialogDescription>
            Paste a TikTok, Instagram, or YouTube link to add a new reel
          </DialogDescription>
        </DialogHeader>
        <EmbedSubmitForm postedById={postedById} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
