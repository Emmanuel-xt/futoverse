import { Inter } from "next/font/google";
import "@styles/globals.css";

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
        <main className="bg-light">
          <div className="">{children}</div>
        </main>
      </body>
    </html>
  );
}
