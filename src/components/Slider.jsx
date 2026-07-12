"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation, Autoplay } from "swiper/modules";
import Link from "next/link";

export default function Slider({ ads }) {
  const getFirstImage = (images) => {
    if (!images) return "/hero.jpg";
    if (Array.isArray(images)) return images[0] || "/hero.jpg";
    try {
      const arr = JSON.parse(images);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : "/hero.jpg";
    } catch {
      return "/hero.jpg";
    }
  };

  return (
    <Swiper
      breakpoints={{
        0: {
          slidesPerView: 1.5,
          spaceBetween: 0,
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 10,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 10,
        },
        1500: {
          slidesPerView: 4,
          spaceBetween: 10,
        },
      }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      modules={[Navigation, Autoplay]}
      className="mySwiper"
      loop
    >
      {ads.map((p) => (
        <SwiperSlide key={p.id}>
          <Link href={`/property/${p.id}`}>
            <div className="flex flex-col p-2 h-87.5 bg-white">
              <img
                src={getFirstImage(p.images)}
                alt={p.title || "Property Image"}
                className="rounded-md w-75 h-55 "
              />
              <div className="flex flex-col items-start h-32.5 justify-between mt-2">
                <div className="flex flex-col items-start">
                  <span className="text-lg font-semibold">{p.title}</span>
                  <span className="text-sm mt-1 text-gray-600">
                    {p.address}
                  </span>
                </div>
                {p.types === "buy" ? (
                  <p className="text-base font-semibold mt-3">
                    <b>قیمت خرید:</b> {p.price ? Number(p.price).toLocaleString("fa-IR") : "-"}{" "}
                    تومان
                  </p>
                ) : (
                  <>
                    <p className="text-sm mt-3">
                      <b>رهن:</b> {p.deposit ? Number(p.deposit).toLocaleString("fa-IR") : "-"}{" "}
                      تومان
                    </p>
                    <p className="text-sm">
                      <b>اجاره ماهیانه:</b>{" "}
                      {p.rent ? Number(p.rent).toLocaleString("fa-IR") : "-"} تومان
                    </p>
                  </>
                )}
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
