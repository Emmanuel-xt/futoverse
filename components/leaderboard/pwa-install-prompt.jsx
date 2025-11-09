"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, Globe } from "lucide-react";

/**
 * Platform detection helpers
 */
function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isAndroid() {
  return /android/i.test(navigator.userAgent);
}
function isStandalone() {
  return (
    (window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true
  );
}

/**
 * PWAInstallPrompt
 * - Shows "native" install prompt when available (beforeinstallprompt).
 * - If not available or user dismisses, shows platform-specific manual instructions:
 *   - Android (Chrome/Edge): Share → Add to home screen OR browser menu → Install.
 *   - iOS (Safari): Share → Add to Home Screen.
 *   - Desktop: Browser menu → Install (Chrome/Edge) or instructions to pin.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: function
 */
export function PWAInstallPrompt({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [installOutcome, setInstallOutcome] = useState(null); // "accepted" | "dismissed" | null

  // Capture beforeinstallprompt when available
  useEffect(() => {
    const handler = (e) => {
      // Prevent the browser from showing the mini-info-bar
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    // In case app is already installed, don't bother
    if (isStandalone()) {
      setDeferredPrompt(null);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Attempt to trigger the native prompt if we have it
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        setInstallOutcome(choice?.outcome ?? "dismissed");
        setDeferredPrompt(null);

        // If accepted, close modal and let caller handle any reward logic
        if (choice?.outcome === "accepted") {
          onClose?.();
        } else {
          // If user dismissed, show manual steps as fallback
          setShowManualGuide(true);
        }
      } catch (err) {
        console.error("Install prompt error:", err);
        setShowManualGuide(true);
      }
      return;
    }

    // No native prompt available — show manual instructions
    setShowManualGuide(true);
  };

  if (!isOpen) return null;

  // Choose platform-specific content
  const platform = isIos() ? "ios" : isAndroid() ? "android" : "desktop";

  // Manual instructions for each platform (clear, concise)
  const ManualBlocks = {
    android: (
      <div className="space-y-3 text-sm text-slate-900 dark:text-slate-100">
        <p className="font-medium">Android (Chrome / Edge / Brave)</p>
        <ol className="list-decimal list-inside ml-4 space-y-2">
          <li>
            Open the browser menu (three dots).{" "}
            <span className="font-semibold">
              Tap "Install app" / "Add to Home screen".
            </span>
          </li>
          <li>
            Alternatively, when you see the browser prompt at the bottom, choose{" "}
            <span className="font-semibold">Install</span>.
          </li>
          <li>
            Confirm by tapping <span className="font-semibold">Add</span> — the
            app will appear on your home screen.
          </li>
        </ol>
      </div>
    ),
    ios: (
      <div className="space-y-3 text-sm text-slate-900 dark:text-slate-100">
        <p className="font-medium">iPhone / iPad (Safari)</p>
        <ol className="list-decimal list-inside ml-4 space-y-2">
          <li>
            Tap the <span className="font-semibold">Share</span> icon (square
            with an arrow).
          </li>
          <li>
            Scroll and select{" "}
            <span className="font-semibold">Add to Home Screen</span>.
          </li>
          <li>
            Confirm the name <span className="font-semibold">Futoverse</span>{" "}
            and tap <span className="font-semibold">Add</span>.
          </li>
        </ol>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
          Note: iOS doesn’t support the native install event — this manual flow
          is the only option.
        </p>
      </div>
    ),
    desktop: (
      <div className="space-y-3 text-sm text-slate-900 dark:text-slate-100">
        <p className="font-medium">Desktop (Chrome / Edge)</p>
        <ol className="list-decimal list-inside ml-4 space-y-2">
          <li>
            If your browser shows an install icon in the address bar (⬇️ or a PC
            icon), click it and follow prompts.
          </li>
          <li>
            Or open the browser menu →{" "}
            <span className="font-semibold">Install Futoverse</span>.
          </li>
          <li>
            The application will be installed and available from your OS app
            list / Dock.
          </li>
        </ol>
      </div>
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-xl border dark:border-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Install Futoverse
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Get quick access + daily rewards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close install modal"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          </button>
        </div>

        {/* Native prompt available? show install CTA */}
        {!showManualGuide ? (
          <>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
              Install Futoverse for faster access, offline support and a daily
              reward.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-lg shadow-md hover:opacity-95"
              >
                <Download className="w-4 h-4" />
                <span>Install App</span>
              </button>

              <button
                onClick={() => setShowManualGuide(true)}
                className="w-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 py-2 rounded-lg"
              >
                Show manual install steps
              </button>

              {/* If native prompt not present, show hint */}
              {!deferredPrompt && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  If the Install button does not work, we’ll show step-by-step
                  instructions for your device.
                </p>
              )}

              {/* Optional small indicator of platform */}
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <Globe className="w-3 h-3" />
                <span>Detected platform: {platform.toUpperCase()}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Manual guide for detected platform */}
            <div className="mb-4">{ManualBlocks[platform]}</div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  // copy short instructions to clipboard for convenience
                  const text =
                    platform === "ios"
                      ? "Safari → Share → Add to Home Screen"
                      : platform === "android"
                        ? "Menu → Install app / Add to Home screen"
                        : "Browser menu → Install Futoverse";
                  navigator.clipboard.writeText(text);
                  // small visual feedback
                  alert("Install steps copied to clipboard");
                }}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 py-2 rounded-lg"
              >
                Copy steps
              </button>

              <button
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-2 rounded-lg"
              >
                Done
              </button>
            </div>
          </>
        )}

        {/* optional small footer showing result */}
        {installOutcome && (
          <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
            Last install outcome: <strong>{installOutcome}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
