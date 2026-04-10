import { Public_Sans } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { CartProvider } from "@/app/Context/CartContext";
import { AddedToCartNotificationProvider } from "@/app/Context/AddedToCartNotification";

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});


export const metadata = {
  title: "My Website",
  description: "Next.js Website",
  metadataBase: new URL("https://bitcoinbutik.com"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={publicSans.className} suppressHydrationWarning={true}>
        <CartProvider>
          <AddedToCartNotificationProvider>
            <div suppressHydrationWarning={true}>
              <Navbar />
              {children}
              <Footer />
            </div>
          </AddedToCartNotificationProvider>
        </CartProvider>
      </body>
    </html>
  );
}