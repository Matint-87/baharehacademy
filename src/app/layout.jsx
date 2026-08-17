import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata = {
  title: "بهاره آکادمی",
  description: "آموزش آشپزی و فروش محصولات غذایی",
  icons: {
    icon: "/images/logo.ico",
    shortcut: "/images/logo.ico",
    apple: "/images/logo.ico",
  },
  other: {
    enamad: "39501475",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-[Number] bg-[#101011]">
        <Header />
        {children}
        <Footer />

        <ToastContainer
          position="bottom-left"
          autoClose={3000}
          hideProgressBar={false}
          theme="dark"
        />
      </body>
    </html>
  );
}
