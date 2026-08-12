"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FaClock, FaUserGraduate } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCartStore } from "@/src/store/useCartStore";

export default function CourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/courses/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setCourse(data.course);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [params.id]);

  if (loading) return <div className="text-center py-20 text-white">در حال بارگذاری...</div>;
  if (!course) return <div className="text-center py-20 text-white">دوره مورد نظر یافت نشد.</div>;

  const handleAddToCart = () => {
    const res = addToCart(course);
    if (res.success) {
      toast.success(res.message, {
        position: "bottom-left",
        theme: "dark",
      });
    } else {
      toast.info(res.message, {
        position: "bottom-left",
        theme: "dark",
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white py-12 px-4">
      <ToastContainer />
      <div className="max-w-4xl mx-auto border border-white/10 bg-[#151516] p-8 rounded-3xl">
        <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
        
        <div className="h-64 w-full bg-gray-800 rounded-2xl mb-6 flex items-center justify-center">
          <span className="text-gray-500">تصویر دوره</span>
        </div>

        <div className="flex gap-6 mb-8 text-sm text-gray-400">
          <div className="flex items-center gap-2"><FaUserGraduate /> مدرس: {course.instructor}</div>
          <div className="flex items-center gap-2"><FaClock /> مدت: {course.duration}</div>
        </div>

        <p className="text-gray-300 leading-relaxed mb-8">{course.description}</p>

        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <span className="text-2xl font-bold text-[#CD9F63]">
            {course.price.toLocaleString()} تومان
          </span>
          <button 
            onClick={handleAddToCart}
            className="bg-[#CD9F63] text-[#111] px-8 py-3 rounded-xl font-bold hover:bg-white transition-all cursor-pointer"
          >
            افزودن به سبد خرید
          </button>
        </div>
      </div>
    </main>
  );
}