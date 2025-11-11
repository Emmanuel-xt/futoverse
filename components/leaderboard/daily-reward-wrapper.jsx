"use client";

import { useEffect, useState } from "react";
import { DailyRewardModal } from "./daily-reward-modal";
import { PWAInstallPrompt } from "./pwa-install-prompt";
import { useSession } from "next-auth/react";
import { useIsPWA } from "hooks/useIsPWA";
import { useDailyLocalStorageCleanup } from "hooks/useDailyLocalStorageCleanup";
import { claimDailyReward } from "@lib/actions/leaderboard-actions";

const getTodayKey = () => {
  const today = new Date().toDateString();
  return `daily_reward_claimed_${today}`;
};

const getInstallPromptShownKey = () => {
  const today = new Date().toDateString();
  return `install_prompt_shown_${today}`;
};

export function DailyRewardWrapper() {
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);
  const isPWA = useIsPWA();
  useDailyLocalStorageCleanup();

  useEffect(() => {
    if (!userId) return;
    if (hasChecked) return;

    const checkReward = async () => {
      setHasChecked(true);

      if (!isPWA) {
        const installPromptKey = getInstallPromptShownKey();
        const alreadyShownToday = localStorage.getItem(installPromptKey);

        if (!alreadyShownToday) {
          // Show install prompt after a brief delay
          const timer = setTimeout(() => {
            setShowInstallPrompt(true);
            localStorage.setItem(installPromptKey, "true");
          }, 1000);
          return () => clearTimeout(timer);
        }
        return;
      }

      const todayKey = getTodayKey();
      const cachedReward = localStorage.getItem(todayKey);

      if (cachedReward) {
        // Already claimed today, skip server call
        return;
      }

      const result = await claimDailyReward(userId);

      if (result?.rewarded) {
        localStorage.setItem(
          todayKey,
          JSON.stringify({
            claimed: true,
            points: result.points,
            timestamp: Date.now(),
          })
        );

        setRewardPoints(result.points || 0);
        setShowRewardModal(true);
      }
    };

    checkReward();
  }, [userId, isPWA, hasChecked]);

  return (
    <>
      <DailyRewardModal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        points={rewardPoints}
      />

      <PWAInstallPrompt
        isOpen={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
      />
    </>
  );
}
