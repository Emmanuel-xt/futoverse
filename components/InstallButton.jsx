"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { DownloadPromptModal } from "./DownloadPromptModal";

export function InstallButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-primary text-white p-2 rounded-full shadow hover:bg-primary/90"
        aria-label="Install App"
      >
        <Download className="h-4 w-4" />
      </button>

      <DownloadPromptModal open={open} onClose={setOpen} />
    </>
  );
}
