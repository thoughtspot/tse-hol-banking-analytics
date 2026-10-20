import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BanksyProvider from "./components/banksy/BanksyProvider";
import SiteHeader from "./components/SiteHeader";
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
  title: {
    default: "Bankalytics",
    template: "%s · Bankalytics",
  },
  description:
    "Analytics across credit cards, checking, savings, and lending for the bank.",
  icons: {
    icon: "/ts.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <BanksyProvider>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
              <span>Bankalytics · Enterprise Analytics Portal</span>
              <span>Figures shown are sample data for demonstration.</span>
            </div>
          </footer>
        </BanksyProvider>
      </body>
    </html>
  );
}
