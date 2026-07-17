import Link from "next/link";
import { FaGithub, FaInstagram } from "react-icons/fa";
import { BsTelegram } from "react-icons/bs";

function Footer() {
  const shopLinks = [
    "ژامبون گوشت",
    "پیتزا",
    "برگر",
    "پاستا",
    "غذاهای ایرانی",
    "دسر و شیرینی",
  ];

  const courseLinks = [
    "شیرینی پزی",
    "آشپزی ایرانی",
    "آشپزی بین الملل",
    "فست فود",
    "دسر و کیک",
    "آموزش حرفه ای",
  ];

  const quickLinks = [
    { title: "خانه", href: "/" },
    { title: "دوره ها", href: "/" },
    { title: "فروشگاه", href: "/" },
    { title: "درباره ما", href: "/" },
    { title: "تماس با ما", href: "/" },
  ];

  return (
    <footer className="w-full border-t border-white/10 bg-[#111111] text-white">
      <div className="mx-auto w-full max-w-375 px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1.8fr_1fr] lg:gap-16">
          {/* Brand */}
          <div className="flex flex-col justify-center gap-6 text-right">
            <div>
              <h2 className="text-2xl font-bold text-[#CD9F63]">
                Cooking Academy
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                آکادمی آشپزی و شیرینی پزی
              </p>
            </div>

            <p className="max-w-sm text-sm leading-8 text-gray-400">
              ما در آکادمی آشپزی به شما کمک می کنیم تا مهارت های آشپزی خود را
              توسعه دهید و به یک آشپز حرفه ای تبدیل شوید.
            </p>

            {/* Social Media */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                aria-label="Instagram"
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#222222] transition-all duration-300 hover:-translate-y-1 hover:border-[#CD9F63] hover:bg-[#CD9F63]"
              >
                <FaInstagram className="text-lg transition-colors group-hover:text-black" />
              </Link>

              <Link
                href="/"
                aria-label="Telegram"
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#222222] transition-all duration-300 hover:-translate-y-1 hover:border-[#CD9F63] hover:bg-[#CD9F63]"
              >
                <BsTelegram className="text-lg transition-colors group-hover:text-black" />
              </Link>

              <Link
                href="/"
                aria-label="Github"
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#222222] transition-all duration-300 hover:-translate-y-1 hover:border-[#CD9F63] hover:bg-[#CD9F63]"
              >
                <FaGithub className="text-lg transition-colors group-hover:text-black" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-10 text-right sm:grid-cols-3">
            {/* Shop */}
            <div className="flex flex-col gap-3">
              <h3 className="mb-2 text-lg font-bold text-white">فروشگاه</h3>

              {shopLinks.map((item, index) => (
                <Link
                  key={index}
                  href="/"
                  className="text-sm text-gray-500 transition duration-300 hover:-translate-x-1 hover:text-[#CD9F63]"
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* Courses */}
            <div className="flex flex-col gap-3">
              <h3 className="mb-2 text-lg font-bold text-white">دوره ها</h3>

              {courseLinks.map((item, index) => (
                <Link
                  key={index}
                  href="/"
                  className="text-sm text-gray-500 transition duration-300 hover:-translate-x-1 hover:text-[#CD9F63]"
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* Quick Links */}
            <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
              <h3 className="mb-2 text-lg font-bold text-[#CD9F63]">
                دسترسی سریع
              </h3>

              {quickLinks.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-sm text-gray-500 transition duration-300 hover:-translate-x-1 hover:text-[#CD9F63]"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="group relative h-65 w-full max-w-105 overflow-hidden rounded-2xl border border-[#CD9F63]/30 bg-[#1b1b1b] shadow-2xl shadow-black/40">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d719.8811129267799!2d51.28897777026306!3d35.75703537913967!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sde!4v1784283218948!5m2!1sen!2sde"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="grayscale-[0.5] contrast-125 transition duration-700 group-hover:scale-105 group-hover:grayscale-0"/>

              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

              <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-white/10 bg-black/50 px-4 py-2 backdrop-blur-md">
                <p className="text-xs text-gray-300">موقعیت آکادمی</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} تمامی حقوق برای Cooking Academy محفوظ
            است.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;