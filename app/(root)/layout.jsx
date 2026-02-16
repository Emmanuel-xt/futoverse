import { Inter } from "next/font/google";
import "@styles/globals.css";
import BottomNav from "@components/BottomNav";
import Provider from "@components/providers/SessionProvider";
import {
  CoreProviders,
  RealtimeProviders,
} from "@components/providers/OptimizedProvidersWrapper";
import { LocationProvider } from "@components/providers/LocationProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DailyRewardWrapper } from "@components/leaderboard/daily-reward-wrapper";
import { ErrorBoundary } from "@components/ui/error-boundary";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  metadataBase: new URL("https://futoverse.com"),
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
          <CoreProviders>
            <RealtimeProviders>
              <LocationProvider>
                <main className="bg-light">
                  <ErrorBoundary>
                  <div className="">{children}</div>
                  </ErrorBoundary>
                  <Toaster />
                  <Analytics />
                  <SpeedInsights />
                  <DailyRewardWrapper />
                  <BottomNav />
                </main>
              </LocationProvider>
            </RealtimeProviders>
          </CoreProviders>
        </Provider>
      </body>
    </html>
  );
}
