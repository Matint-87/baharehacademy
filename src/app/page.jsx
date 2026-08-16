import Hero from "../components/Hero";
import Rezome from "../components/Rezome";
import ProfileCompletionGuard from "../components/ProfileCompletionGuard";
import CoursesSlider from "../components/CoursesSlider";
import ProductsSlider from "../components/ProductsSlider";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function Home() {
  return (
    <>
      <ProfileCompletionGuard />
      <Hero />
      <section className="my-8 w-full px-4 sm:my-10 sm:px-8 lg:px-20">
        <div className="mx-auto flex min-h-105 w-full 2xl:w-[70%] max-w-400 flex-col">
          <div className="flex min-h-17.5 items-center justify-between gap-4">
            <h2 className="text-base font-bold text-white sm:text-lg">
              محصولات جدید
            </h2>
            <Link
              href="/products"
              className="flex shrink-0 items-center gap-2 text-xs font-medium text-[#CD9F63] transition duration-300 hover:gap-3 sm:text-sm"
            >
              مشاهده همه
              <FaArrowLeft className="text-xs sm:text-sm" />
            </Link>
          </div>
          <div className="min-h-87.5 w-full flex-1">
            <ProductsSlider />
          </div>
        </div>
      </section>
      <Rezome />
      <section className="my-8 w-full px-4 sm:my-10 sm:px-8 lg:px-20">
        <div className="mx-auto flex min-h-105 w-full 2xl:w-[70%] max-w-400 flex-col">
          <div className="flex min-h-17.5 items-center justify-between gap-4">
            <h2 className="text-base font-bold text-white sm:text-lg">
              دوره‌های جدید
            </h2>
            <Link
              href="/courses"
              className="flex shrink-0 items-center gap-2 text-xs font-medium text-[#CD9F63] transition duration-300 hover:gap-3 sm:text-sm"
            >
              مشاهده همه
              <FaArrowLeft className="text-xs sm:text-sm" />
            </Link>
          </div>
          <div className="min-h-87.5 w-full flex-1">
            <CoursesSlider />
          </div>
        </div>
      </section>
    </>
  );
}
