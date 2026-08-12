"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaClock, FaUserGraduate, FaArrowLeft } from "react-icons/fa";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch("/api/courses");
        const data = await response.json();
        if (data.success) {
          setCourses(data.courses);
        }
      } catch (error) {
        console.error("Failed to load courses", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0b0c] px-4 py-25 text-white">
      <div className="mx-auto max-w-6xl">
        
        {/* هدر صفحه */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl">دوره‌های تخصصی آشپزی</h1>
          <p className="mt-3 text-sm text-gray-400">
            مهارت‌های آشپزی خود را با اساتید برتر آکادمی به سطح حرفه‌ای برسانید.
          </p>
        </div>

        {/* حالت بارگذاری */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-400 text-sm">
            در حال بارگذاری دوره‌ها...
          </div>
        ) : courses.length === 0 ? (
          <div className="flex justify-center items-center py-20 text-gray-400 text-sm">
            هنوز دوره‌ای ثبت نشده است.
          </div>
        ) : (
          /* لیست کارت‌های دوره */
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#151516]/80 p-5 backdrop-blur-xl transition-all hover:border-[#CD9F63]/50 hover:shadow-xl hover:shadow-black/40"
              >
                <div>
                  <div className="relative mb-4 h-48 w-full overflow-hidden rounded-2xl bg-gray-800 flex items-center justify-center text-gray-600 font-bold">
                    تصویر دوره
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-[#CD9F63] transition-colors">
                    {course.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-gray-400 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div>
                  <div className="my-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-gray-400">
                    <span>مدرس: {course.instructor}</span>
                    <span>مدت: {course.duration}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#CD9F63]">
                      {course.price.toLocaleString()} تومان
                    </span>
                    <Link
                      href={`/courses/${course.id}`}
                      className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#CD9F63] hover:text-[#111]"
                    >
                      <span>مشاهده جزئیات</span>
                      <FaArrowLeft className="text-[10px]" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}