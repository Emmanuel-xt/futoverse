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

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FUTO-VERSE",
  description: "Shaping the future of Campus Navigation and Business Promotion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <SocketProvider>
            <OnlineUsersProvider>
              <OnlineShopsProvider>
                <LocationProvider>
                  <CesiumViewerProvider>
                    <CartProvider>
                      <main className="bg-light">
                        <div className="">{children}</div>
                        <Toaster />
                        <ButtomNav />
                        <CesiumMapB />
                      </main>
                    </CartProvider>
                  </CesiumViewerProvider>
                </LocationProvider>
              </OnlineShopsProvider>
            </OnlineUsersProvider>
          </SocketProvider>
        </Provider>
      </body>
    </html>
  );
}
