"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { DownloadPromptModal } from "./DownloadPromptModal";
import { useIsPWA } from "hooks/useIsPWA";

/**
 * This component displays a floating install button (Download icon)
 * ONLY if the user is not running the app as an installed PWA.
 */
export function InstallButton() {
  const [open, setOpen] = useState(false);
  const isPWA = useIsPWA(); // Detect whether app is installed

  // ✅ If app is already installed, don't render the button at all
  if (isPWA) return null;

  return (
    <>
      {/* Install button (only shown when app is not installed) */}
      <button
        onClick={() => setOpen(true)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-primary text-white p-2 rounded-full shadow hover:bg-primary/90"
        aria-label="Install Futoverse"
      >
        <Download className="h-4 w-4" />
      </button>

      {/* Installation modal prompt */}
      <DownloadPromptModal open={open} onClose={setOpen} />
    </>
  );
}
