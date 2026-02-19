"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "./style.css";

// import required modules
import { Pagination, Autoplay } from "swiper/modules";

export default function ProductSlider() {
  return (
    <Swiper
      breakpoints={{
        320: { slidesPerView: 1.5 },   
        480: { slidesPerView: 2 },   
        768: { slidesPerView: 3 },   
        1024: { slidesPerView: 4 },  
        1280: { slidesPerView: 5 },  
      }}      
      spaceBetween={50} 
      loop={true}       
      autoplay={{
        delay: 5000,   
        disableOnInteraction: false, 
      }}
      modules={[Pagination, Autoplay]}
      className="mySwiper"
    >
      <SwiperSlide>Slide 1</SwiperSlide>
      <SwiperSlide>Slide 2</SwiperSlide>
      <SwiperSlide>Slide 3</SwiperSlide>
      <SwiperSlide>Slide 4</SwiperSlide>
      <SwiperSlide>Slide 5</SwiperSlide>
      <SwiperSlide>Slide 6</SwiperSlide>
      <SwiperSlide>Slide 7</SwiperSlide>
      <SwiperSlide>Slide 8</SwiperSlide>
      <SwiperSlide>Slide 9</SwiperSlide>
    </Swiper>
  );
}