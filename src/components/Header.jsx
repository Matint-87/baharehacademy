"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiShoppingBasketLine } from "react-icons/ri";

function Header() {
  const pathName = usePathname();
  let profile = false;

  const navLink = [
    { title: "خانه", href: "/" },
    { title: " دوره‌ها", href: "/courses" },
    { title: "محصولات", href: "/products" },
    { title: "وبلاگ", href: "/blog" },
    { title: "درباره ما", href: "/about-us" },
  ];
  return (
    <>
      <div className="bg-white mobile:w-full px-5 laptop:w-[80%] h-20 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          <div className="">
            <span className="font-bold text-4xl text-[#CD2C58]">
              Yu<span className="text-[#56DFCF]">mmy</span>
              <span className="text-[#FFDE63]">Lab</span>
            </span>
          </div>
          {/* <div className="flex gap-4 pr-8 pt-5 mobile:hidden laptop:flex">
            {navLink.map((item) => (
              <Link
                className={
                  pathName === item.href
                    ? "font-[Number] text-sm text-[#2b2b2b]"
                    : "font-[Number] text-sm text-[#2b2b2b]"
                }
                key={item.title}
                href={item.href}
              >
                {item.title}
              </Link>
            ))}
          </div> */}
        </div>
        <div className="flex gap-4 items-center">
          {!profile ? (
            <Link href="/login">
              <div className=" shadow rounded-[10px] px-2.5 py-2.5 flex justify-center items-center text-[14px] bg-[#e24257] font-[Number] text-white hover:bg-[#e24257] transition-all duration-300 ease-linear">
                ورود و ثبت‌نام
              </div>
            </Link>
          ) : (
            <Link href="/profile">
              <div className="rounded-full w-11.25 h-11.25">
                <Image
                  src="/image/profile.jpg"
                  className="rounded-full"
                  alt="Dashboard"
                  width={45}
                  height={45}
                />
              </div>
            </Link>
          )}
          <Link href="/cart">
            <div className="shadow p-1.5 rounded-[10px] flex relative justify-center items-center text-[14px] bg-[#F7F8FA] font-[Number] text-white ">
              <span className="cursor-pointer bg-[#FE5F55] absolute flex items-center justify-center rounded-full text-white w-5 h-5 -top-1.25 left-7.5 font-[Number]">
                {0}
              </span>
              <RiShoppingBasketLine className="text-3xl text-[#FE5F55] pt-1.5 hover:text-[#FE5F55] transition-all duration-200 ease-linear" />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Header;
