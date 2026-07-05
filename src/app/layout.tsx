import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PWAProvider } from "@/components/PWA";
import { ClerkProviderWrapper } from "@/components/ClerkProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Verso - Sales Wellbeing Diagnostic",
  description: "Discover your Sales Wellbeing Pattern - a free diagnostic tool that helps you understand how you respond to challenging situations in sales environments.",
  keywords: ["sales", "wellbeing", "diagnostic", "mental health", "sales performance", "sales patterns", "driver", "strategist", "connector", "reactor"],
  authors: [{ name: "Verso Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Verso - Sales Wellbeing Diagnostic",
    description: "Discover your Sales Wellbeing Pattern in 3-5 minutes",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verso - Sales Wellbeing Diagnostic",
    description: "Discover your Sales Wellbeing Pattern in 3-5 minutes",
    images: ["/logo.png"],
  },
  themeColor: "#0891b2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Verso",
    startupImage: [
      { url: "/logo.png", media: "(device-width: 430px)" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: "Verso",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Verso" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Apple Touch Icon - Required for iOS */}
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/logo.png" />
        
        {/* Manifest Link */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Color for Safari */}
        <meta name="theme-color" content="#0891b2" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0891b2" media="(prefers-color-scheme: dark)" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ClerkProviderWrapper>
          <PWAProvider>
            {children}
            <Toaster />
          </PWAProvider>
        </ClerkProviderWrapper>
      </body>
    </html>
  );
}
