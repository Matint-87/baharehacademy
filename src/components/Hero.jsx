"use client";

import Image from "next/image";
import Link from "next/link";
import { FaBook } from "react-icons/fa";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { PiCertificateFill, PiCookingPotFill } from "react-icons/pi";

export default function Hero() {
  const features = [
    {
      icon: <PiCookingPotFill />,
      title: "تجهیزات حرفه‌ای",
      subtitle: "از برندهای برتر دنیا",
    },
    {
      icon: <PiCertificateFill />,
      title: "گواهینامه معتبر",
      subtitle: "بین‌المللی و قابل ترجمه",
    },
    {
      icon: <FaBook />,
      title: "دوره‌های متنوع",
      subtitle: "از مبتدی تا حرفه‌ای",
    },
    {
      icon: <LiaChalkboardTeacherSolid />,
      title: "آشپزهای حرفه‌ای",
      subtitle: "مدرسین حرفه‌ای",
    },
  ];

  return (
    <section className="relative min-h-150 w-full overflow-hidden font-[Number] shadow-lg sm:min-h-140 md:h-150 2xl:h-170">
      {/* Background */}
      <Image
        src="/images/hero.png"
        alt="آکادمی آشپزی"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-120 items-center px-5 pt-8 text-white sm:px-10 md:min-h-125 lg:px-20">
        <div className="flex w-full max-w-xl flex-col items-center gap-5 text-center lg:items-start lg:text-right">
          <h1 className="text-2xl font-bold leading-[1.8] sm:text-3xl md:text-4xl lg:text-5xl">
            هنر آشپزی را حرفه‌ای بیاموزید با{" "}
            <span className="text-[#CD9F63]">دوره‌های</span> آموزشی آکادمی ما
          </h1>

          <p className="max-w-lg text-sm leading-8 text-white/80 sm:text-base">
            از مبتدی تا حرفه‌ای همراه شما هستیم تا به یک سرآشپز واقعی تبدیل
            شوید.
          </p>

          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link
              href="/courses"
              className="
                w-full rounded-lg bg-[#CD9F63]
                px-6 py-3 text-sm font-bold text-[#101011]
                shadow-lg shadow-[#CD9F63]/20
                transition-all duration-300
                hover:-translate-y-1 hover:bg-[#dfb477]
                sm:w-auto
              "
            >
              مشاهده دوره‌ها
            </Link>

            <Link
              href="/products"
              className="
                w-full rounded-lg border border-white/20
                bg-[#101011]/80 px-6 py-3
                text-sm font-bold text-white
                backdrop-blur-sm
                transition-all duration-300
                hover:-translate-y-1 hover:border-[#CD9F63]
                hover:text-[#CD9F63]
                sm:w-auto
              "
            >
              بازدید از محصولات
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="relative z-10 px-4 pb-5 sm:absolute sm:bottom-4 sm:left-0 sm:right-0 sm:px-6">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {features.map((item, index) => (
            <div
              key={index}
              className="
                group flex min-h-20 items-center justify-center gap-2
                rounded-2xl border border-white/25
                bg-white/15 px-2 py-3
                text-white shadow-lg shadow-black/10
                backdrop-blur-xl
                transition-all duration-300 ease-out
                hover:-translate-y-2
                hover:border-white/40
                hover:bg-white/25
                hover:shadow-xl hover:shadow-black/20
                sm:gap-3 sm:px-3
              "
            >
              <div
                className="
                  flex h-9 w-9 shrink-0 items-center justify-center
                  rounded-xl bg-white/15
                  text-xl text-white
                  transition-transform duration-300
                  group-hover:rotate-6 group-hover:scale-110
                  sm:h-11 sm:w-11 sm:text-2xl
                "
              >
                {item.icon}
              </div>

              <div className="flex min-w-0 flex-col text-right leading-tight">
                <span className="truncate text-[11px] font-bold text-white sm:text-sm md:text-base">
                  {item.title}
                </span>

                <span className="mt-1 text-[9px] font-medium text-white/70 sm:text-xs">
                  {item.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
