"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaClock, FaUserGraduate } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

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

  // بررسی پایان مهلت ثبت‌نام دوره - اگه تموم شده باشه دکمه غیرفعال میشه
  const isFinished = course.endDate ? new Date(course.endDate) < new Date() : false;

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: "COURSE", courseId: course.id }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          toast.info("برای افزودن به سبد خرید ابتدا وارد حساب کاربری خود شوید.", {
            position: "bottom-left",
            theme: "dark",
          });
          router.push("/login");
          return;
        }
        throw new Error(data.error || "خطا در افزودن به سبد خرید");
      }

      toast.success("دوره با موفقیت به سبد خرید اضافه شد!", {
        position: "bottom-left",
        theme: "dark",
      });
      window.dispatchEvent(new Event("cart-changed"));
    } catch (err) {
      toast.error(err.message, { position: "bottom-left", theme: "dark" });
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white py-12 px-4">
      <ToastContainer />
      <div className="max-w-4xl mx-auto border border-white/10 bg-[#151516] p-8 rounded-3xl">
        <h1 className="text-3xl font-bold mb-6">{course.title}</h1>

        <div className="h-64 w-full bg-gray-800 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
          {course.image ? (
            <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-500">تصویر دوره</span>
          )}
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

          {isFinished ? (
            <span className="text-xs text-red-400 bg-red-500/10 px-4 py-3 rounded-xl font-bold">
              مهلت ثبت‌نام این دوره به پایان رسیده است
            </span>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="bg-[#CD9F63] text-[#111] px-8 py-3 rounded-xl font-bold hover:bg-white transition-all cursor-pointer disabled:opacity-50"
            >
              {addingToCart ? "در حال افزودن..." : "افزودن به سبد خرید"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}