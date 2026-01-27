import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumosity Leaderboard",
  description: "Compare your Lumosity game scores with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
