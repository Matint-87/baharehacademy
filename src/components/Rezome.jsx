import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBookOpen,
  FaAward,
  FaCheck,
  FaGraduationCap,
  FaHeadset,
} from "react-icons/fa";

const stats = [
  {
    number: "8,500+",
    title: "دانشجوی موفق",
    icon: <FaUserGraduate />,
  },
  {
    number: "50+",
    title: "مدرس حرفه‌ای",
    icon: <FaChalkboardTeacher />,
  },
  {
    number: "120+",
    title: "دوره آموزشی",
    icon: <FaBookOpen />,
  },
  {
    number: "15+",
    title: "سال تجربه",
    icon: <FaAward />,
  },
];

const features = [
  {
    title: "مدرسین حرفه‌ای",
    description: "با سابقه سال‌ها تجربه",
    icon: <FaGraduationCap />,
  },
  {
    title: "آموزش عملی",
    description: "تمرین در کلاس‌های مدرن",
    icon: <FaCheck />,
  },
  {
    title: "پشتیبانی نامحدود",
    description: "پشتیبانی کلاس‌ها پس از دوره",
    icon: <FaHeadset />,
  },
];

function Rezome() {
  return (
    <section className="w-full px-4 py-14 sm:px-8 lg:px-20">
      <div className="mx-auto grid w-full max-w-350 grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Why Cooking Academy */}
        <div className="flex flex-col text-right">

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            چرا کوکینگ آکادمی؟
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-8 text-gray-400 sm:text-base">
            ما با ترکیب تجربه، کیفیت و عشق به آشپزی، بهترین آموزش‌ها را برای شما
            فراهم می‌کنیم تا بتوانید مهارت‌های خود را به صورت حرفه‌ای توسعه دهید.
          </p>

          {/* Features */}
          <div className="mt-8 flex flex-col gap-5">
            {features.map((item, index) => (
              <div
                key={index}
                className="group flex items-center gap-4 rounded-2xl border border-transparent p-3 transition-all duration-300 hover:border-[#CD9F63]/20 hover:bg-white/2"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#CD9F63]/40 bg-[#111111]/70 text-lg text-[#CD9F63] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#CD9F63] group-hover:text-black">
                  {item.icon}
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-bold text-white sm:text-lg">
                    {item.title}
                  </h2>

                  <p className="text-xs text-gray-500 sm:text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.map((item, index) => (
            <div
              key={index}
              className="group flex min-h-37.5 items-center justify-center gap-4 rounded-2xl border border-white/10 bg-[#151617] px-4 py-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#CD9F63]/40 hover:bg-[#191a1b] hover:shadow-[0_15px_40px_rgba(205,159,99,0.08)]"
            >
              {/* Icon */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#CD9F63]/40 bg-[#1b1b1b] text-xl text-[#CD9F63] transition-all duration-300 group-hover:scale-110 group-hover:border-[#CD9F63] sm:h-16 sm:w-16 sm:text-2xl">
                {item.icon}
              </div>

              {/* Text */}
              <div className="text-right">
                <h2 className="text-2xl font-bold tracking-wide text-[#CD9F63] sm:text-3xl">
                  {item.number}
                </h2>

                <p className="mt-2 text-xs text-gray-300 sm:text-sm">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Rezome;