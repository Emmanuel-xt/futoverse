import { useCallback } from "react";

export function useScrollPosition(key: string) {
  const saveScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      const scrollPosition = window.scrollY;
      sessionStorage.setItem(`scroll-${key}`, scrollPosition.toString());
    }
  }, [key]);

  const restoreScrollPosition = useCallback(() => {
    if (typeof window !== "undefined") {
      const savedPosition = sessionStorage.getItem(`scroll-${key}`);
      if (savedPosition) {
        setTimeout(() => {
          window.scrollTo(0, Number.parseInt(savedPosition, 10));
        }, 100);
      }
    }
  }, [key]);

  const savePage = useCallback((page: number) => {
    sessionStorage.setItem(`page-${key}`, page.toString());
  }, [key]);

  const restorePage = useCallback(() => {
    const page = sessionStorage.getItem(`page-${key}`);
    return page ? parseInt(page, 10) : 1;
  }, [key]);

  const clear = useCallback(() => {
    sessionStorage.removeItem(`scroll-${key}`);
    sessionStorage.removeItem(`page-${key}`);
  }, [key]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    savePage,
    restorePage,
    clear,
  };
}
