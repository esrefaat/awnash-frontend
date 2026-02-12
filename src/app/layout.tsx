import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientProviders from "@/components/providers/ClientProviders";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Awnash Admin Dashboard",
  description: "Admin dashboard for Awnash equipment rental platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} h-full`}>
        <ClientProviders>
          <div className="App h-full">
            {children}
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
