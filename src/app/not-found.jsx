import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

function page() {
  return (
    <>
    <div className="flex flex-col gap-7 items-center justify-center h-[80vh]">
      <div className="font-bold font-[Number] mobile:text-xl tablet:text-2xl text-white capitalize">
        صفحه‌ای که دنبال آن بودید پیدا نشد!
      </div>
      <div className="flex items-center text-sm gap-2 text-[#CD9F63]">
        <Link className="font-[Number]" href="/">
          صفحه اصلی
        </Link>
        <FaArrowLeft />
      </div>
    </div>
    </>
  );
}

export default page;
