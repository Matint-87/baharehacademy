"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/src/store/useCartStore";
import { FaTrash, FaArrowRight, FaShoppingBasket } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  // محاسبه جمع کل قیمت‌ها
  const totalPrice = cart.reduce((acc, item) => acc + item.price, 0);

  const handleCheckout = async () => {
    // بررسی اینکه آیا کاربر لاگین کرده است یا خیر
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید.", { theme: "dark" });
      return;
    }

    const user = JSON.parse(savedUser);
    setLoading(true);

    try {
      // ارسال سفارشات به API ثبت سفارش
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items: cart.map((item) => item.id), // ارسال لیست شناسه‌های دوره‌ها
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("سفارش شما با موفقیت ثبت شد!", { theme: "dark" });
        clearCart(); // خالی کردن سبد خرید بعد از ثبت موفق
      } else {
        toast.error(data.error || "خطا در ثبت سفارش", { theme: "dark" });
      }
    } catch (err) {
      console.error(err);
      toast.error("خطای سرور در ثبت سفارش", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0b0c] px-4 py-12 text-white">
      <ToastContainer />
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <FaShoppingBasket className="text-[#CD9F63]" />
          سبد خرید شما
        </h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-white/10 bg-[#151516]/80 rounded-3xl">
            <p className="text-gray-400 mb-6">سبد خرید شما خالی است.</p>
            <Link
              href="/courses"
              className="flex items-center gap-2 bg-[#CD9F63] text-[#111] px-6 py-3 rounded-xl font-bold hover:bg-white transition-all"
            >
              <span>مشاهده دوره‌ها</span>
              <FaArrowRight />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* لیست دوره‌های داخل سبد */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border border-white/10 bg-[#151516]/80 p-5 rounded-2xl backdrop-blur-xl"
                >
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-400">مدرس: {item.instructor}</p>
                    <span className="text-sm font-bold text-[#CD9F63] mt-3 inline-block">
                      {item.price.toLocaleString()} تومان
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                    title="حذف دوره"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>

            {/* فاکتور و نهایی کردن خرید */}
            <div className="border border-white/10 bg-[#151516]/80 p-6 rounded-3xl h-fit backdrop-blur-xl">
              <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-4">
                خلاصه سفارش
              </h2>
              <div className="flex justify-between mb-6 text-sm text-gray-300">
                <span>مجموع اقلام:</span>
                <span>{cart.length} دوره</span>
              </div>
              <div className="flex justify-between mb-8 text-lg font-bold">
                <span>مبلغ قابل پرداخت:</span>
                <span className="text-[#CD9F63]">{totalPrice.toLocaleString()} تومان</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#CD9F63] text-[#111] py-3 rounded-xl font-bold hover:bg-white transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "در حال ثبت سفارش..." : "تایید و ثبت نهایی سفارش"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}