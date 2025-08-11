import { Inter } from "next/font/google";
import "@styles/globals.css";
import Provider from "@components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Futo Verse",
  description:
    "Join the Futoverse app — the ultimate 3D campus experience awaits you!",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/logo-192x192.png",
    apple: "/icons/logo-192x192.png",
  },
  openGraph: {
    title: "Futo Verse",
    description:
      "Join the Futoverse app — the ultimate 3D campus experience awaits you!",
    url: "https://futo-verse.vercel.app/signup", // your full signup URL here
    siteName: "Futo Verse",
    images: [
      {
        url: "https://futo-verse.vercel.app/images/mainflier.jpg", // image for social preview
        width: 1200,
        height: 630,
        alt: "Futo Verse - 3D Campus Experience",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Futo Verse",
    description:
      "Join the Futoverse app — the ultimate 3D campus experience awaits you!",
    images: ["https://futo-verse.vercel.app/images/mainflier.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <main className="bg-light">
            <div className="">{children}</div>
          </main>
        </Provider>
      </body>
    </html>
  );
}
