import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCjAbLm2WV9mqx9s4KwwCYLakAzu1d_vPk", // TODO: REMOVE_FALLBACK
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "chatapp-e19.firebaseapp.com", // TODO: REMOVE_FALLBACK
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "chatapp-e19", // TODO: REMOVE_FALLBACK
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "chatapp-e19.firebasestorage.app", // TODO: REMOVE_FALLBACK
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "448707058259", // TODO: REMOVE_FALLBACK
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:448707058259:web:9ab850f8ee2620610f04a6", // TODO: REMOVE_FALLBACK
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-4WGDMQ1X64", // TODO: REMOVE_FALLBACK
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
