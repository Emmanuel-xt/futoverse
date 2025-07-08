import { Inter } from "next/font/google";
import "@styles/globals.css";
import ButtomNav from "@components/ButtomNav";
import Provider from "@components/providers/SessionProvider";
import { SocketProvider } from "@components/providers/SocketProvider";
import { OnlineUsersProvider } from "@components/providers/OnlineUsersProvider";
import { OnlineShopsProvider } from "@components/providers/OnlineShopsProvider";
import { LocationProvider } from "@components/providers/LocationProvider";
import { CesiumViewerProvider } from "@components/providers/CesiumViewerProvider";
import { Toaster } from "sonner";
import { CartProvider } from "@components/providers/CartProvider";
import CesiumMapB from "@components/cesium/Cesium";
import CesiumMapBWrapper from "@components/cesium/CesiumWrapper";
import { TanStackQueryProvider } from "@components/providers/TanstackQueryProvider";
import NotificationManager from "@components/notification-manager";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Futo Verse",
  description: "The first ever 3D digital map of FUTO",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/logo-192x192.png",
    apple: "/icons/logo-192x192.png",
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <TanStackQueryProvider>
            <SocketProvider>
              <OnlineUsersProvider>
                <OnlineShopsProvider>
                  <LocationProvider>
                    {/* <CesiumViewerProvider> */}
                    <CartProvider>
                      <main className="bg-light">
                        <div className="">{children}</div>
                        <Toaster />
                        <ButtomNav />
                        {/* <CesiumMapB /> */}
                        {/* <CesiumMapBWrapper /> */}
                      </main>
                    </CartProvider>
                    {/* </CesiumViewerProvider> */}
                  </LocationProvider>
                </OnlineShopsProvider>
              </OnlineUsersProvider>
            </SocketProvider>
          </TanStackQueryProvider>
        </Provider>
      </body>
    </html>
  );
}
