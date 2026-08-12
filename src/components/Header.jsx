"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/src/store/useCartStore";
import {
  RiBookOpenLine,
  RiShoppingBagLine,
  RiFileListLine,
  RiInformationLine,
  RiShoppingBasketLine,
  RiSearchLine,
  RiUserLine,
  RiLogoutBoxRLine,
} from "react-icons/ri";

function Header() {
  const pathName = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // گرفتن تعداد اقلام سبد خرید از Zustand
  const cart = useCartStore((state) => state.cart);
  const totalItems = cart.length;

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Error parsing user from localStorage", e);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    window.location.href = "/login";
  };

  const navLinks = [
    { title: "دوره‌ها", href: "/courses", icon: <RiBookOpenLine /> },
    { title: "محصولات", href: "/products", icon: <RiShoppingBagLine /> },
    { title: "دستور پخت", href: "/recipe", icon: <RiFileListLine /> },
    { title: "درباره ما", href: "/about", icon: <RiInformationLine /> },
  ];

  if (pathName !== "/admin") {
    return (
      <>
        <header className="w-full h-17.5 flex justify-center items-center bg-[#101011]/95 backdrop-blur-[14px] sticky top-0 z-50 border-b border-[#1E1E1D]">
          <div className="w-[85%] flex items-center h-full justify-between">
            {/* Logo */}
            <Link href="/" className="">
              <span className="text-2xl text-[#e24257]">C</span>
              <span className="text-xl text-[#FFDE63]">A</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex gap-6 h-5 px-5 items-center">
              {navLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    pathName === item.href
                      ? "text-[#CD9F63]"
                      : "text-white hover:text-[#CD9F63]"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <RiSearchLine className="text-2xl text-white cursor-pointer hover:text-[#CD9F63] transition-colors" />
              
              {/* Cart Icon */}
              <Link href="/cart">
                <div className="relative p-2">
                  {totalItems > 0 && (
                    <span className="px-1.5 py-0.5 absolute -top-1 -right-2 text-xs flex items-center justify-center rounded-full bg-[#CD9F63] text-[#101011] font-bold">
                      {totalItems}
                    </span>
                  )}
                  <RiShoppingBasketLine className="text-2xl text-white hover:text-[#CD9F63] transition-colors" />
                </div>
              </Link>

              {/* Conditional Auth Section */}
              {isMounted && user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#151516] px-3 py-2 text-sm text-white transition-all hover:border-[#CD9F63]/50 cursor-pointer"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#CD9F63]/10 text-[#CD9F63]">
                      <RiUserLine />
                    </div>
                    <span className="hidden sm:inline">
                      {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.phoneNumber}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 rounded-2xl border border-white/10 bg-[#151516] p-2 shadow-2xl backdrop-blur-xl z-50">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-gray-300 transition-colors hover:bg-white/5 hover:text-[#CD9F63]"
                      >
                        <RiUserLine className="text-base" />
                        تکمیل / ویرایش پروفایل
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-red-400 transition-colors hover:bg-red-500/10 cursor-pointer"
                      >
                        <RiLogoutBoxRLine className="text-base" />
                        خروج از حساب
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hover:bg-[#101011] hover:text-[#CD9F63] hover:border-[#CD9F63] border duration-200 flex justify-center items-center bg-[#CD9F63] text-[#101011] rounded py-2 px-4"
                >
                  <span className="text-sm font-medium">ورود / ثبت‌نام</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Bottom Nav */}
        <nav className="fixed backdrop-blur-[14px] bg-[#101011]/40 bottom-0 left-0 w-full shadow-md flex justify-around items-center py-2 lg:hidden z-50 border-t border-[#1E1E1D]">
          {navLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`flex flex-col items-center text-[10px] duration-300 ${
                pathName === item.href ? "text-[#CD9F63]" : "text-gray-200"
              }`}
            >
              <div className="text-xl">{item.icon}</div>
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </>
    );
  }
}

export default Header;