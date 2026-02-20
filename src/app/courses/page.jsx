import CourseItem from "@/src/components/CourseItem";
import Link from "next/link";
import { BiCategory } from "react-icons/bi";
import { FiSearch } from "react-icons/fi";
import { IoIosCalendar } from "react-icons/io";
import { RiSortDesc } from "react-icons/ri";
import { SlCalender } from "react-icons/sl";
import { HiOutlineFilter } from "react-icons/hi";
import { IoClose } from "react-icons/io5";

export async function generateMetadata() {
  return {
    title: "دوره‌های آموزشی | تقویم آموزشی",
    description: "لیست کامل دوره‌های آموزشی با امکان فیلتر و جستجو",
    openGraph: {
      title: "دوره‌های آموزشی",
      description: "لیست کامل دوره‌های آموزشی با امکان فیلتر و جستجو",
      images: "",
    },
  };
}

// Static course data
const courses = [
  {
    id: 1,
    title: "دوره برنامه نویسی جاوا اسکریپت",
    price: 200000,
    category: "برنامه نویسی",
    startDate: "آذر 1404",
    image: "/images/course1.jpg",
    students: 1250,
    duration: "۳۲ ساعت",
    level: "مقدماتی",
  },
  {
    id: 2,
    title: "دوره طراحی وب با React",
    price: 350000,
    category: "فرانت اند",
    startDate: "دی 1404",
    image: "/images/course2.jpg",
    students: 890,
    duration: "۴۵ ساعت",
    level: "پیشرفته",
  },
  {
    id: 3,
    title: "دوره پایگاه داده SQL",
    price: 250000,
    category: "دیتابیس",
    startDate: "بهمن 1404",
    image: "/images/course3.jpg",
    students: 2100,
    duration: "۲۸ ساعت",
    level: "متوسط",
  },
  {
    id: 4,
    title: "دوره هوش مصنوعی با Python",
    price: 500000,
    category: "هوش مصنوعی",
    startDate: "اسفند 1404",
    image: "/images/course4.jpg",
    students: 560,
    duration: "۶۰ ساعت",
    level: "پیشرفته",
  },
  {
    id: 5,
    title: "دوره سئو و دیجیتال مارکتینگ",
    price: 180000,
    category: "مارکتینگ",
    startDate: "فروردین 1405",
    image: "/images/course5.jpg",
    students: 3450,
    duration: "۲۵ ساعت",
    level: "مقدماتی",
  },
  {
    id: 6,
    title: "دوره امنیت سایبری",
    price: 400000,
    category: "امنیت",
    startDate: "اردیبهشت 1405",
    image: "/images/course6.jpg",
    students: 780,
    duration: "۵۰ ساعت",
    level: "متوسط",
  },
  {
    id: 7,
    title: "دوره توسعه اندروید",
    price: 300000,
    category: "اپلیکیشن موبایل",
    startDate: "خرداد 1405",
    image: "/images/course7.jpg",
    students: 1120,
    duration: "۴۰ ساعت",
    level: "متوسط",
  },
  {
    id: 8,
    title: "دوره مدیریت پروژه با Agile",
    price: 220000,
    category: "مدیریت",
    startDate: "تیر 1405",
    image: "/images/course8.jpg",
    students: 670,
    duration: "۳۵ ساعت",
    level: "مقدماتی",
  },
  {
    id: 9,
    title: "دوره توسعه بازی با Unity",
    price: 450000,
    category: "بازی سازی",
    startDate: "مرداد 1405",
    image: "/images/course9.jpg",
    students: 430,
    duration: "۵۵ ساعت",
    level: "پیشرفته",
  },
];

// Categories data
const categories = [
  "برنامه نویسی",
  "فرانت اند",
  "دیتابیس",
  "هوش مصنوعی",
  "مارکتینگ",
  "امنیت",
  "اپلیکیشن موبایل",
  "مدیریت",
  "بازی سازی",
];

// Dates data
const dates = [
  "آذر 1404",
  "دی 1404",
  "بهمن 1404",
  "اسفند 1404",
  "فروردین 1405",
  "اردیبهشت 1405",
  "خرداد 1405",
  "تیر 1405",
  "مرداد 1405",
];

function Page() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-25">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section with Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <IoIosCalendar className="text-[#CD2C58]" />
                <span>تقویم آموزشی</span>
              </h1>
              <p className="text-gray-600 text-lg">
                {courses.length} دوره آموزشی فعال
              </p>
            </div>
          </div>
        </div>

        {/* Search and Sort Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Sort Options */}
            <div className="flex-1">
              <div className="flex items-center gap-4 p-2 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 text-gray-700 border-l-2 border-gray-300 pl-4">
                  <RiSortDesc className="text-xl text-[#CD2C58]" />
                  <span className="font-medium whitespace-nowrap">مرتب‌سازی:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    "همه دوره‌ها",
                    "ارزان‌ترین",
                    "گران‌ترین",
                    "پرمخاطب‌ها",
                    "جدیدترین",
                  ].map((item) => (
                    <Link
                      key={item}
                      href={""}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[#CD2C58] hover:text-white whitespace-nowrap"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="lg:w-96">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    placeholder="جستجوی دوره مورد نظر..."
                    className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#CD2C58] focus:ring-2 focus:ring-[#CD2C58]/20 transition-all"
                  />
                </div>
                <button className="bg-[#CD2C58] text-white px-6 py-3 rounded-xl hover:bg-[#b3204a] transition-all transform hover:scale-105 shadow-md hover:shadow-lg whitespace-nowrap">
                  جستجو
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
              
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <HiOutlineFilter className="text-[#CD2C58] text-xl" />
                  <h3 className="font-bold text-gray-900 text-lg">فیلترها</h3>
                </div>
                <button className="text-sm text-[#CD2C58] hover:text-[#b3204a] font-medium flex items-center gap-1">
                  <IoClose size={18} />
                  حذف همه
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <BiCategory className="text-[#CD2C58] text-xl" />
                  <h4 className="font-bold text-gray-900">دسته‌بندی دوره‌ها</h4>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pl-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58] focus:ring-offset-0"
                      />
                      <span className="text-gray-700 group-hover:text-[#CD2C58] transition-colors flex-1">
                        {category}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {Math.floor(Math.random() * 10) + 1}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <SlCalender className="text-[#CD2C58] text-xl" />
                  <h4 className="font-bold text-gray-900">تاریخ شروع</h4>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pl-2">
                  {dates.map((date) => (
                    <label
                      key={date}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58] focus:ring-offset-0"
                      />
                      <span className="text-gray-700 group-hover:text-[#CD2C58] transition-colors">
                        {date}
                      </span>
                    </label>
                  ))}
                </div>
              </div>


              {/* Apply Filters Button */}
              <button className="w-full bg-[#CD2C58] text-white py-3 rounded-xl hover:bg-[#b3204a] transition-all transform hover:scale-105 shadow-md hover:shadow-lg font-medium">
                اعمال فیلترها
              </button>
            </div>
          </div>

          {/* Course Grid */}
          <div className="lg:w-3/4">
            {/* Selected Filters */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-sm text-gray-600">فیلترهای فعال:</span>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
                <span>برنامه نویسی</span>
                <button className="text-gray-500 hover:text-[#CD2C58]">
                  <IoClose size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
                <span>آذر 1404</span>
                <button className="text-gray-500 hover:text-[#CD2C58]">
                  <IoClose size={16} />
                </button>
              </div>
              <button className="text-[#CD2C58] text-sm hover:underline">
                پاک کردن همه
              </button>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <CourseItem courses={courses} />
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
                <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#CD2C58] hover:text-[#CD2C58] transition-all">
                  قبلی
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      page === 1
                        ? "bg-[#CD2C58] text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:border-[#CD2C58] hover:text-[#CD2C58] transition-all">
                  بعدی
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

export default Page;