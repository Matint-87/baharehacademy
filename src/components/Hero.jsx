"use client";
import Image from "next/image";
import { useState } from "react";
import { FaBook, FaBoxOpen, FaUser, FaUtensils } from "react-icons/fa";

export default function Hero() {
  const [courses, setCourses] = useState(12);

  return (
    <div className="relative font-[Number] w-full h-137.5 md:h-112.5 2xl:h-150 overflow-hidden shadow-lg">
      <Image
        src="/images/pizza-salami.jpg"
        alt="آکادمی آشپزی"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 gap-5 flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="text-3xl md:text-5xl font-bold drop-shadow-lg">
          مهارت‌های آشپزی خود را ارتقا دهید
        </h1>
        <p className="text-sm md:text-lg lg:mt-3 opacity-90">
          دوره‌های آشپزی حرفه‌ای در آکادمی ما
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="flex justify-center items-center gap-2 px-5 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-500/30 text-gray-800 dark:text-white rounded-xl select-none font-bold transition-transform transform hover:-translate-y-2 hover:scale-105 hover:bg-white/30 dark:hover:bg-gray-800/40 hover:text-white">
            <div className="flex flex-col items-center">
              <span>{courses}+</span>
              <span>دوره فعال</span>
            </div>
            <FaBook className="text-lg" />
          </div>

          <div className="flex justify-center items-center gap-2 px-5 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-500/30 text-gray-800 dark:text-white rounded-xl select-none font-bold transition-transform transform hover:-translate-y-2 hover:scale-105 hover:bg-white/30 dark:hover:bg-gray-800/40 hover:text-white">
            <div className="flex flex-col items-center">
              <span>50+</span>
              <span>محصول</span>
            </div>
            <FaBoxOpen className="text-lg" />
          </div>

          <div className="flex justify-center items-center gap-2 px-5 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-500/30 text-gray-800 dark:text-white rounded-xl select-none font-bold transition-transform transform hover:-translate-y-2 hover:scale-105 hover:bg-white/30 dark:hover:bg-gray-800/40 hover:text-white">
            <div className="flex flex-col items-center">
              <span>120+</span>
              <span>دستور پخت</span>
            </div>
            <FaUtensils className="text-lg" />
          </div>

          <div className="flex justify-center items-center gap-2 px-5 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-500/30 text-gray-800 dark:text-white rounded-xl select-none font-bold transition-transform transform hover:-translate-y-2 hover:scale-105 hover:bg-white/30 dark:hover:bg-gray-800/40 hover:text-white">
            <div className="flex flex-col items-center">
              <span>1200+</span>
              <span>هنرجو</span>
            </div>
            <FaUser className="text-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
