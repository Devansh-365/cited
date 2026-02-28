import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cited | Is AI Recommending Your Brand?",
  description:
    "Find out if ChatGPT, Perplexity, and Google AI recommend your D2C brand — or your competitors. Free audit in 60 seconds.",
  openGraph: {
    title: "Cited",
    description:
      "Check if ChatGPT recommends your brand or your competitor. Free AI visibility audit for D2C brands.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
