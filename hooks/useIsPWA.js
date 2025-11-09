import { useEffect, useState } from "react";

export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone;
      setIsPWA(isStandalone);
    };

    checkPWA();

    // Listen for mode changes (Android Chrome supports this)
    window
      .matchMedia("(display-mode: standalone)")
      .addEventListener("change", checkPWA);

    return () => {
      window
        .matchMedia("(display-mode: standalone)")
        .removeEventListener("change", checkPWA);
    };
  }, []);

  return isPWA;
}
