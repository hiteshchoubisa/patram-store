import "./globals.css";
import { siteConfig } from "../config/site";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { CartProvider } from "../components/cart/CartProvider";
import { CustomerAuthProvider } from "../contexts/CustomerAuthContext";
import type { Metadata } from "next";
import WhatsAppSupportBadge from "../components/support/WhatsAppSupportBadge";

export const metadata = {
  title: 'Patram Store',
  description: 'Aromatic & Ayurvedic Products',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      { rel: 'manifest', url: '/site.webmanifest' }
    ]
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
        <WhatsAppSupportBadge />
      </body>
    </html>
  );
}
