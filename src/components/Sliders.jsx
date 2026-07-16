import Link from "next/link"
import { FaArrowLeft } from "react-icons/fa"
import Slider from "./Slider"

function Sliders() {
  return (
    <div className="flex w-full items-center px-20 h-120 my-10">
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-full h-[20%] flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">دوره‌های جدید</h2>
                <Link href="/courses" className="text-[#CD9F63] flex items-center gap-2 text-sm font-medium">
                    مشاهده همه
                    <FaArrowLeft />
                </Link>
            </div>
            <div className="w-full h-[80%]">
                <Slider/>
            </div>
        </div>
    </div>
  )
}

export default Sliders