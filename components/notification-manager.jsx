"use client";

import { useEffect } from "react";
import useFcmToken from "hooks/useFcmToken";
import { useSession } from "next-auth/react";
import { saveFcmToken } from "@lib/notification/notification-action";

export default function NotificationManager() {
  const { token, notificationPermissionStatus } = useFcmToken();
  const { data: session } = useSession();
  const user = session?.user; // Assuming user is available in session

  // Save token to database when both user and token are available
  useEffect(() => {
    const saveToken = async () => {
      if (token && user?.id && notificationPermissionStatus === "granted") {
        try {
          const result = await saveFcmToken(token, Number(user.id));
          if (result.success) {
            console.log("FCM token saved successfully");
          } else {
            console.error("Failed to save FCM token:", result.error);
          }
        } catch (error) {
          console.error("Error saving FCM token:", error);
        }
      }
    };

    saveToken();
  }, [token, user?.id, notificationPermissionStatus]);

  return null; // This component doesn't render anything
}
