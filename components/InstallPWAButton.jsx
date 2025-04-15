// components/InstallPWAButton.tsx
"use client";

import { useInstallPrompt } from "hooks/useInstallPrompt";
import { useState } from "react";
// import { useInstallPrompt } from "@/hooks/useInstallPrompt";

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
      className="bg-primary text-white py-2 px-3 font-semibold rounded-3xl"
    >
      Launch the App
    </button>
  );
}
