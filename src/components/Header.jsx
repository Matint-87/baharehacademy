"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiBookOpenLine,
  RiShoppingBagLine,
  RiFileListLine,
  RiInformationLine,
  RiShoppingBasketLine,
  RiSearchLine,
} from "react-icons/ri";

function Header() {
  const pathName = usePathname();
  const profile = false;

  const navLinks = [
    { title: "دوره‌ها", href: "/courses", icon: <RiBookOpenLine /> },
    { title: "محصولات", href: "/products", icon: <RiShoppingBagLine /> },
    { title: "دستور پخت", href: "/recipe", icon: <RiFileListLine /> },
    { title: "درباره ما", href: "/about", icon: <RiInformationLine /> },
  ];

  if (pathName !== "/admin") {
    return (
      <>
        {/* <header className="w-full flex justify-center items-center bg-gray-50">
          <div className="w-[65%] md:w-[50%] 2xl:w-[35%] px-8 h-16 fixed top-4 z-50 rounded-4xl backdrop-blur-[14px] bg-white/40 border border-[#ECECEC] shadow-lg flex items-center justify-between">
            <Link href="/" className="">
              <span className="text-2xl text-[#e24257]">C</span>
              <span className="text-xl text-[#FFDE63]">A</span>
            </Link>
            <nav className="hidden lg:flex gap-6 h-5 px-5 items-center border-x border-[#EDEDED]">
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
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                {!profile ? (
                  <Link
                    href="/login"
                    className="hover:bg-white text-xs hover:text-[#e24257] hover:border-[#e24257] bg-[#e24257] border border-white text-white duration-300 flex items-center justify-center h-11 px-6 md:px-5 rounded-4xl md:text-sm"
                  >
                    ورود / ثبت‌نام
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
                  <div className="relative bg-gray-100 p-2 rounded-full border border-[#FE5F55]">
                    <span className="absolute -top-1 -left-2 w-6 h-4 text-xs flex items-center justify-center rounded-2xl bg-[#FE5F55] text-white">
                      10
                    </span>
                    <RiShoppingBasketLine className="text-2xl text-[#FE5F55]" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </header> */}

        <header className="w-full h-17.5 flex justify-center items-center bg-[#101011]/95 backdrop-blur-[14px] fixed top-0 z-50 border-b border-[#1E1E1D]">
          <div className="w-[85%] flex items-center h-full justify-between">
            <Link href="/" className="">
              <span className="text-2xl text-[#e24257]">C</span>
              <span className="text-xl text-[#FFDE63]">A</span>
            </Link>
            <nav className="hidden lg:flex gap-6 h-5 px-5 items-center ">
              {navLinks.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`text-sm font-medium ${
                    pathName === item.href
                      ? "text-[#CD9F63]"
                      : "text-white hover:text-[#CD9F63]"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-5 ">
              <RiSearchLine className="text-2xl text-white cursor-pointer" />
              <Link href="/cart">
                <div className="relative p-2">
                  <span className="px-1.5 py-0.5 absolute -top-1 -right-2 text-xs flex items-center justify-center rounded-full bg-[#CD9F63] text-[#101011]">
                    10
                  </span>
                  <RiShoppingBasketLine className="text-2xl text-white" />
                </div>
              </Link>
              <Link
                href="/login"
                className="hover:bg-[#101011] hover:text-[#CD9F63] hover:border-[#CD9F63] border duration-200 flex justify-center items-center bg-[#CD9F63] text-[#101011] rounded py-2 px-4"
              >
                <span className="text-sm">ورود / ثبت‌نام</span>
              </Link>
            </div>
          </div>
        </header>

        <nav className="fixed backdrop-blur-[14px] bg-white/40 bottom-0 left-0 w-full shadow-md flex justify-around items-center py-2 lg:hidden z-50">
          {navLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`flex flex-col items-center text-[10px] hover:text-[#e24257] duration-300 ${
                pathName === item.href ? "text-[#e24257]" : "text-gray-800"
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
