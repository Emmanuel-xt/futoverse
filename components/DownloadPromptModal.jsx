"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";

export function DownloadPromptModal({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install Futoverse</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 text-center">
          {/* <h6 className="text-xl font-semibold">
            How to Install the App on Your Phone
          </h6> */}
          <ul className="text-sm text-slate-700 text-left list-decimal list-inside space-y-2">
            <li>
              On <strong>Android (Chrome)</strong>, tap the{" "}
              <strong>three-dot menu</strong> in the top-right corner.
            </li>
            <li>
              Select <strong>"Add to Home screen"</strong> from the menu
              options.
            </li>
            <li>
              On <strong>iPhone (Safari)</strong>, tap the{" "}
              <strong>share icon</strong> (square with an arrow) at the bottom.
            </li>
            <li>
              Scroll down and tap <strong>"Add to Home Screen"</strong>.
            </li>
            <li>Confirm the prompt.</li>
          </ul>

          <button
            onClick={() => setlaunchAppModal(false)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm transition"
          >
            Alright
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
