import { useEffect } from "react";

export function useDailyLocalStorageCleanup() {
  useEffect(() => {
    const today = new Date().toDateString();
    const lastCleanup = localStorage.getItem("last_cleanup_date");

    // ✅ Already cleaned today → skip
    if (lastCleanup === today) return;

    // 🧹 Loop through all keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // clean old daily reward keys
      if (key.startsWith("daily_reward_claimed_")) {
        const dateStr = key.replace("daily_reward_claimed_", "");
        const storedDate = new Date(dateStr);

        // remove if not today's date
        if (storedDate.toDateString() !== today) {
          localStorage.removeItem(key);
        }
      }

      // optionally, clean other time-based keys if needed
      if (key.startsWith("install_prompt_shown_")) {
        const dateStr = key.replace("install_prompt_shown_", "");
        const storedDate = new Date(dateStr);
        if (storedDate.toDateString() !== today) {
          localStorage.removeItem(key);
        }
      }
    }

    // 🏁 Mark cleanup as done for today
    localStorage.setItem("last_cleanup_date", today);
  }, []);
}
