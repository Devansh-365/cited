import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <header className="border-b border-card-border bg-card-bg">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-accent font-bold text-sm">C</span>
              </div>
              <span className="font-semibold text-primary text-lg">
                Cited
              </span>
            </a>
            <span className="text-xs text-muted hidden sm:block">
              by UpCited &times; ReferRush
            </span>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-card-border mt-16 py-8 text-center text-sm text-muted">
          <div className="max-w-5xl mx-auto px-4">
            Built by{" "}
            <a
              href="https://upcited.com"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              UpCited
            </a>{" "}
            — AI Visibility for D2C Brands
          </div>
        </footer>
      </body>
    </html>
  );
}
