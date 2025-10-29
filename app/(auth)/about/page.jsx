import AboutClientPage from "@components/about/AboutClient"

export const metadata = {
  title: "About Futoverse | University Companion App",
  description:
    "Discover Futoverse - the ultimate university companion featuring 3D campus mapping, social networking, and marketplace. Transform your campus experience.",
  keywords: "university app, campus mapping, 3D navigation, student social network, campus marketplace",
  authors: [{ name: "Futoverse Team" }],
  openGraph: {
    title: "About Futoverse | University Companion App",
    description: "The ultimate university companion with 3D campus mapping, social networking, and marketplace.",
    type: "website",
    url: "https://futoverse.com/about",
    images: [
      {
        url: "https://futoverse.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Futoverse - University Companion App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Futoverse | University Companion App",
    description:
      "Transform your university experience with 3D navigation, social connections, and real-time campus life.",
    images: ["https://futoverse.com/og-image.jpg"],
  },
}

export default function AboutPage() {
  return <AboutClientPage />
}
