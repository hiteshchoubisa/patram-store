import "./globals.css";
import { siteConfig } from "../config/site";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { CartProvider } from "../components/cart/CartProvider";
import { CustomerAuthProvider } from "../contexts/CustomerAuthContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s • ${siteConfig.name}`
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.baseUrl),
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.baseUrl,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white text-neutral-900" suppressHydrationWarning>
        <CustomerAuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
