import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import AppProvider from "@/provider/AppProvider";
import AuthProvider from "@/provider/AuthProvider";
import { Toaster } from "sonner";
import SmoothScrollProvider from "@/provider/SmoothScrollprovider";

const siteUrl = "https://www.noltra.ai";
const siteTitle = "Noltra.ai | AI Business Operating System";
const siteDescription =
  "The AI-powered business operating system for modern enterprises.";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: "/fav.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Noltra.ai",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/noltra-social-logo.png",
        width: 600,
        height: 600,
        alt: "Noltra.ai logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
    images: ["/noltra-social-logo.png"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased`}>
        <NextTopLoader color="#0070f3" height={3} showSpinner={false} />
        <AppProvider>
          <AuthProvider>
           <SmoothScrollProvider>{children}</SmoothScrollProvider>
              <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
