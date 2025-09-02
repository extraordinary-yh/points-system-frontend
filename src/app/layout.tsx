import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthWrapper } from "../components/AuthWrapper";
import { SidebarProvider } from "../contexts/SidebarContext";
import { ReLoginPrompt } from "../components/Auth/ReLoginPrompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "P2E Student Dashboard",
  description: "Point-to-Earn Student Dashboard for tracking rewards and activities",
  icons: {
    icon: '/images/p2e-logo.jpg',
    shortcut: '/images/p2e-logo.jpg',
    apple: '/images/p2e-logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/p2e-logo.jpg" />
        <link rel="shortcut icon" href="/images/p2e-logo.jpg" />
        <link rel="apple-touch-icon" href="/images/p2e-logo.jpg" />
      </head>
      <body className={`${inter.className} text-stone-950 bg-stone-100`}>
        <AuthWrapper>
          <SidebarProvider>
            {children}
            <ReLoginPrompt />
          </SidebarProvider>
        </AuthWrapper>
      </body>
    </html>
  );
}
