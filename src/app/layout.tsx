import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import AppProvider from "@/provider/AppProvider";
import AuthProvider from "@/provider/AuthProvider";
import { Toaster } from "sonner";
import SmoothScrollProvider from "@/provider/SmoothScrollprovider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mordechaibai | AI Business Operating System",
  description: "The AI-powered business operating system for modern enterprises",
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
