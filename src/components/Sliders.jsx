import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import Slider from "./Slider";

function Sliders() {
  return (
    <section className="my-8 w-full px-4 sm:my-10 sm:px-8 lg:px-20">
      <div className="mx-auto flex min-h-105 w-full max-w-400 flex-col">
        {/* Header */}
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

        {/* Slider */}
        <div className="min-h-87.5 w-full flex-1">
          <Slider />
        </div>
      </div>
    </section>
  );
}

export default Sliders;