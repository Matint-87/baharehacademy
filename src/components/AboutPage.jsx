import React from "react";

export const metadata = {
  title: "درباره ما",
  description:
    "آکادمی آموزش آشپزی و شیرینی‌پزی با مدیریت بهاره اسفندیاری. برگزارکننده دوره‌های تخصصی حضوری و آنلاین در حوزه کیک، شیرینی، آشپزی ملل و فرآورده‌های گوشتی.",
};

export default function AboutPage() {
  return (
    <main className="bg-white">

      {/* Hero Section */}
      <section className="bg-gray-50 text-gray-700 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            درباره آکادمی آموزش آشپزی و شیرینی‌پزی
          </h1>
          <p className="text-lg leading-8 max-w-3xl mx-auto">
            این مجموعه با هدف آموزش تخصصی، مهارتی و کاربردی در حوزه آشپزی و
            شیرینی‌پزی فعالیت می‌کند و تاکنون صدها هنرجو را وارد بازار کار کرده است.
          </p>
        </div>
      </section>

      {/* About Brand */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-10">

          <div>
            <h2 className="text-2xl font-semibold mb-4">
              رسالت ما
            </h2>
            <p className="text-gray-700 leading-8">
              هدف ما تربیت هنرجویان حرفه‌ای در حوزه شیرینی‌پزی، کیک‌های مجلل،
              آشپزی ملل و تولید فرآورده‌های گوشتی است؛ به‌گونه‌ای که بتوانند
              کسب‌وکار شخصی خود را راه‌اندازی کنند و وارد بازار کار شوند.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">
              حوزه‌های آموزشی
            </h2>
            <ul className="grid md:grid-cols-2 gap-4 text-gray-700">
              <li>✔ آموزش شیرینی‌پزی خانگی و حرفه‌ای</li>
              <li>✔ کیک‌های مجلل عروسی و کیک‌های خامه‌ای</li>
              <li>✔ آموزش فوندانت و دکور کیک</li>
              <li>✔ آشپزی ملل و غذاهای سنتی</li>
              <li>✔ غذاهای فوری و فست‌فود</li>
              <li>✔ فرآورده‌های گوشتی (سوسیس و کالباس)</li>
              <li>✔ آشپزی کودکان</li>
              <li>✔ آموزش بدون فر و با مایکروفر</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">
              چرا این آکادمی؟
            </h2>
            <p className="text-gray-700 leading-8">
              ترکیب تجربه عملی در آشپزخانه صنعتی، دانش تخصصی، آموزش کاربردی و
              پشتیبانی هنرجویان پس از دوره، باعث شده هنرجویان بسیاری بتوانند
              برند شخصی خود را راه‌اندازی کنند.
            </p>
          </div>

        </div>
      </section>

      {/* Instructor Section */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">

          <h2 className="text-3xl font-bold text-center mb-12">
            مدرسین مجموعه
          </h2>

          <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-semibold mb-2">
              بهاره اسفندیاری
            </h3>
            <p className="text-gray-600 leading-7">
              مربی و مدرس حرفه‌ای آشپزی و شیرینی‌پزی با سابقه برگزاری
              کارگاه‌های تخصصی از سال ۱۳۹۳ تا کنون. مدرس دوره‌های کیک‌های
              مجلل، شیرینی‌پزی حرفه‌ای، آشپزی ملل و فرآورده‌های گوشتی.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          آماده یادگیری مهارت‌های تخصصی هستید؟
        </h2>
        <p className="text-gray-600 mb-6">
          برای مشاهده دوره‌ها و ثبت‌نام آنلاین، وارد بخش دوره‌ها شوید.
        </p>
        <a
          href="/courses"
          className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full transition"
        >
          مشاهده دوره‌ها
        </a>
      </section>

    </main>
  );
}