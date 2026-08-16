"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import Link from "next/link";
import { IoMdPricetags } from "react-icons/io";
import { BiSolidOffer } from "react-icons/bi";

export default function CoursesSlider() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses/latest")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCourses(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">در حال بارگذاری دوره‌ها...</div>;
  }

  if (courses.length === 0) {
    return <div className="text-center py-8 text-gray-400">دوره‌ای یافت نشد.</div>;
  }

  return (
    <Swiper
      breakpoints={{
        0: { slidesPerView: 1.5, spaceBetween: 0 },
        640: { slidesPerView: 2, spaceBetween: 10 },
        1024: { slidesPerView: 3, spaceBetween: 10 },
        1500: { slidesPerView: 4, spaceBetween: 10 },
      }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      modules={[Navigation, Autoplay]}
      className="mySwiper"
      loop
    >
      {courses.map((course) => (
        <SwiperSlide key={course.id}>
          <Link
            href={`/courses/${course.id}`}
            className="group relative block w-55 md:w-70 overflow-hidden rounded-2xl border border-white/8 bg-[#101011]/80 shadow-[0_10px_35px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:border-[#CD9F63]/40 hover:shadow-[0_15px_45px_rgba(205,159,99,0.12)]"
          >
            <div className="relative h-41 overflow-hidden">
              <img
                src={course.image || "/images/kek.jpeg"}
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#101011] via-transparent to-transparent" />
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[#CD9F63]/30 bg-black/50 px-3 py-1 text-xs text-[#CD9F63] backdrop-blur-md">
                <BiSolidOffer />
                <span>{course.duration}</span>
              </div>
            </div>
            <div className="flex flex-col items-center px-5 pb-5 pt-3">
              <div className="w-full text-center">
                <h2 className="my-1 text-sm font-bold text-white line-clamp-1">
                  {course.title}
                </h2>
                <p className="mt-2 text-xs leading-5 text-gray-500 line-clamp-2">
                  {course.description}
                </p>
              </div>
              <div className="my-4 h-px w-full bg-linear-to-r from-transparent via-[#2a2a2a] to-transparent" />
              <div className="flex w-full items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-gray-400">
                  <IoMdPricetags className="text-base text-[#CD9F63]" />
                  <span>{course.price.toLocaleString()} تومان</span>
                </span>
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}