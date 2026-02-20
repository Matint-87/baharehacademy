"use client";

import Link from "next/link";
import Image from "next/image";
import { IoIosCalendar, IoIosPerson, IoIosTime } from "react-icons/io";
import { BiCategory } from "react-icons/bi";

export default function CourseItem({ courses }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-500">دوره‌ای برای نمایش وجود ندارد</p>
      </div>
    );
  }

  return (
    <>
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/course/${course.slug || course.id}`}
          className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
        >
          {/* Course Image */}
          <div className="relative h-48 overflow-hidden">
            {course.image ? (
              <Image
                src={course.image}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#CD2C58]/20 to-[#8B1E3F]/20 flex items-center justify-center">
                <IoIosCalendar className="text-4xl text-[#CD2C58]/40" />
              </div>
            )}
            {/* Price Badge */}
            {course.price && (
              <div className="absolute top-3 left-3 bg-[#CD2C58] text-white px-3 py-1 rounded-full text-sm font-bold">
                {course.price.toLocaleString()} تومان
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="p-4">
            <h3 className="font-bold text-gray-800 mb-2 group-hover:text-[#CD2C58] transition-colors line-clamp-2">
              {course.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {course.description || course.excerpt}
            </p>

            {/* Course Meta */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              {course.category && (
                <div className="flex items-center gap-1">
                  <BiCategory className="text-[#CD2C58]" />
                  <span>{course.category}</span>
                </div>
              )}
              {course.duration && (
                <div className="flex items-center gap-1">
                  <IoIosTime />
                  <span>{course.duration} ساعت</span>
                </div>
              )}
              {course.students && (
                <div className="flex items-center gap-1">
                  <IoIosPerson />
                  <span>{course.students.toLocaleString()} دانشجو</span>
                </div>
              )}
            </div>

            {/* Start Date */}
            {course.startDate && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm">
                <IoIosCalendar className="text-[#CD2C58]" />
                <span className="text-gray-600">شروع: {course.startDate}</span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </>
  );
}