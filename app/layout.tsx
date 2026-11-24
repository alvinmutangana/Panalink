import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist } from "next/font/google";
import "./globals.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PanaLink: Closer markets. Greater opportunities.",
    template: "%s · PanaLink",
  },
  description:
    "PanaLink connects rural sellers in Rwanda with buyers in towns and cities.",
};

export const viewport: Viewport = { themeColor: "#173F35" };

function HeaderFallback() {
  return (
    <div className="border-b bg-background">
      <div className="container-page py-4 text-xl font-semibold tracking-tight text-primary">
        PanaLink
      </div>
    </div>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Suspense fallback={<HeaderFallback />}>
          <SiteHeader />
        </Suspense>
        <div id="content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </div>
        <Suspense fallback={null}>
          <SiteFooter />
        </Suspense>
      </body>
    </html>
  );
}
