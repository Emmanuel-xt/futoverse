import { Inter } from "next/font/google";
import "@styles/globals.css";
import ButtomNav from "@components/ButtomNav";
import Provider from "@components/providers/SessionProvider";
import { SocketProvider } from "@components/providers/SocketProvider";
import { OnlineUsersProvider } from "@components/providers/OnlineUsersProvider";
import { OnlineShopsProvider } from "@components/providers/OnlineShopsProvider";
import { LocationProvider } from "@components/providers/LocationProvider";
import { Toaster } from "sonner";
import { CartProvider } from "@components/providers/CartProvider";
import { TanStackQueryProvider } from "@components/providers/TanstackQueryProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Futoverse - 3D Digital Twin of FUTO Campus",
  icons: {
    icon: "/icons/logo-192x192.png",
    apple: "/icons/logo-192x192.png",
  },
  manifest: "/manifest.json",
  description:
    "Explore FUTO campus map in 3D, connect with students, and discover marketplace deals. Futoverse is the all-in-one platform for university life.",
  keywords: [
    "FUTO",
    "Futo",
    "futoverse",
    "university app",
    "campus mapping",
    "3D campus",
    "student social network",
    "marketplace",
    "university companion",
    "Futo digtal twin",
  ],
  authors: [{ name: "Futoverse Team" }],
  creator: "Futoverse",
  publisher: "Futoverse",
  generator: "Futoverse",
  applicationName: "Futoverse",
  category: "Education",

  openGraph: {
    type: "website",
    url: "https://futoverse.com",
    title: "Futoverse - 3D Digital Twin of FUTO Campus",
    description:
      "Explore your campus in 3D, connect with students, and discover marketplace deals. Futoverse is the all-in-one platform for university life.",
    siteName: "Futoverse",
    images: [
      {
        url: "https://futoverse.com/images/mainflier.jpg",
        width: 1200,
        height: 630,
        alt: "Futoverse - 3D Digital Twin of FUTO Campus",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Futoverse - 3D Digital Twin of FUTO Campus",
    description:
      "Explore your campus in 3D, connect with students, and discover marketplace deals.",
    images: ["https://futoverse.com/images/mainflier.jpg"],
    creator: "@futoverse",
  },

  robots: "index, follow",
  alternates: {
    canonical: "https://futoverse.com",
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
                        <Analytics />
                        <SpeedInsights />
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
