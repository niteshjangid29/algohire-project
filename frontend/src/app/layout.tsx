import type { Metadata } from "next";
import { Inter } from "next/font/google"; // FIX: Use a standard font like Inter
import "./globals.css";

// FIX: Configure a standard, available font
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AlgoHire Webhook Dashboard",
  description: "Manage and monitor your webhook subscriptions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}