"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiHomeLine,
  RiBookOpenLine,
  RiShoppingBagLine,
  RiFileListLine,
  RiInformationLine,
  RiShoppingBasketLine,
} from "react-icons/ri";

function Header() {
  const pathName = usePathname();
  const profile = false;

  const navLinks = [
    { title: "خانه", href: "/", icon: <RiHomeLine /> },
    { title: "دوره‌ها", href: "/courses", icon: <RiBookOpenLine /> },
    { title: "محصولات", href: "/products", icon: <RiShoppingBagLine /> },
    { title: "دستور پخت", href: "/recipe", icon: <RiFileListLine /> },
    { title: "درباره ما", href: "/about", icon: <RiInformationLine /> },
  ];

  return (
    <>
      <header className="bg-white w-full px-5 lg:px-16 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-5">
          <span className="font-bold text-2xl text-[#CD2C58]">
            Yu<span className="text-[#56DFCF]">mmy</span>
            <span className="text-[#FFDE63]">Lab</span>
          </span>
          <nav className="hidden lg:flex gap-6">
            {navLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`text-sm font-medium ${
                  pathName === item.href
                    ? "text-[#CD2C58]"
                    : "text-gray-700 hover:text-[#CD2C58]"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center">
          <div className="flex items-center gap-4">
            {!profile ? (
              <Link
                href="/login"
                className="bg-[#e24257] text-white px-3 py-2 rounded-lg text-sm"
              >
                ورود و ثبت‌نام
              </Link>
            ) : (
              <Image
                src="/image/profile.jpg"
                className="rounded-full"
                alt="Profile"
                width={40}
                height={40}
              />
            )}

            <Link href="/cart">
              <div className="relative bg-gray-100 p-1.5 rounded">
                <span className="absolute -top-2 -left-2 w-4.5 h-4.5 text-xs flex items-center justify-center rounded-full bg-[#FE5F55] text-white">
                  0
                </span>
                <RiShoppingBasketLine className="text-2xl text-[#FE5F55]" />
              </div>
            </Link>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md flex justify-around items-center py-2 lg:hidden z-50">
        {navLinks.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={`flex flex-col items-center text-[10px] hover:text-[#e24257] duration-300 ${
              pathName === item.href ? "text-[#e24257]" : "text-gray-500"
            }`}
          >
            <div className="text-xl">{item.icon}</div>
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="h-16 lg:hidden"></div>
    </>
  );
}

export default Header;
