import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjAbLm2WV9mqx9s4KwwCYLakAzu1d_vPk",
  authDomain: "chatapp-e19.firebaseapp.com",
  projectId: "chatapp-e19",
  storageBucket: "chatapp-e19.firebasestorage.app",
  messagingSenderId: "448707058259",
  appId: "1:448707058259:web:9ab850f8ee2620610f04a6",
  measurementId: "G-4WGDMQ1X64",
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export { app, messaging };
