// components/InstallPWAButton.tsx
"use client";

import { useState } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export default function InstallPWAButton() {
  const { deferredPrompt, isInstallable } = useInstallPrompt();
  const [installed, setInstalled] = useState(false);

  const handleClick = async () => {
    if (deferredPrompt) {
      // @ts-ignore
      deferredPrompt.prompt();
      // @ts-ignore
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setInstalled(true);
      }
    }
  };

  if (!isInstallable || installed) return null;

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 mt-4 bg-blue-600 text-white rounded-md shadow-lg"
    >
      Install FutoVerse App
    </button>
  );
}
