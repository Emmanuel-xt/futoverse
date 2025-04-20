// // hooks/useInstallPrompt.ts
// import { useEffect, useState } from "react";

// export function useInstallPrompt() {

//   const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

//   const [isInstallable, setIsInstallable] = useState(false);

//   useEffect(() => {
//     const handler = (e: Event) => {
//       e.preventDefault();
//       setDeferredPrompt(e);
//       setIsInstallable(true);
//     };

//     window.addEventListener("beforeinstallprompt", handler);

//     return () => window.removeEventListener("beforeinstallprompt", handler);
//   }, []);

//   return { deferredPrompt, isInstallable };
// }
