import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Same Day Ramps - Admin",
  description: "Admin dashboard for Same Day Ramps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
