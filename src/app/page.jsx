import { Testimonials } from "../components/Testimonials";
import Hero from "../components/Hero";
import ProductSlider from "../components/ProductSlider";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Hero />
      {/* <div className="flex px-5 my-20 flex-col gap-10">
        <div className="flex justify-between">
        <h1 className="text-xl font-bold">محصولات جدید</h1>
        <Link href="/products" className="text-sm font-bold flex items-center gap-2 text-[#E24257]">
          <span>مشاهده همه</span>
          <FaArrowLeft />
        </Link>
        </div>
        <div className="h-70">
          <ProductSlider />
        </div>
      </div> */}
    </main>
  );
}
