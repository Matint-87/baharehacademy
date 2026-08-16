"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FaTrash, FaArrowRight, FaShoppingBasket, FaMinus, FaPlus, FaSignInAlt } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// اگه هر محصول step متفاوت داره (مثلاً بعضی ۱۰۰ گرمی و بعضی ۵۰ گرمی)،
// این باید از خود آبجکت محصول خونده بشه (info.step) نه یک مقدار ثابت سراسری.
const DEFAULT_PRODUCT_STEP = 100;

export default function CartPage() {
  const [cart, setCart] = useState(null); // { items: [], total: 0 } از سرور
  const [authed, setAuthed] = useState(null); // null = هنوز چک نشده
  const [pageLoading, setPageLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [pendingItemId, setPendingItemId] = useState(null); // جلوگیری از کلیک‌های همزمان روی یک آیتم

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // خواندن سبد واقعی از سرور - تنها منبع حقیقت
  const loadCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        setAuthed(false);
        setCart({ items: [], total: 0 });
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "خطا در دریافت سبد خرید");
      }
      setAuthed(true);
      setCart(data.cart);
    } catch (err) {
      toast.error(err.message || "خطا در دریافت سبد خرید", { theme: "dark" });
      setCart({ items: [], total: 0 });
    }
  }, []);

  // بارگذاری اولیه: سبد خرید از سرور + پرکردن خودکار فرم گیرنده از پروفایل کاربر
  useEffect(() => {
    (async () => {
      setPageLoading(true);
      await loadCart();
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const fullName = `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim();
          setRecipientName(fullName);
          setRecipientPhone(data.user.phoneNumber || "");
          setShippingAddress(data.user.addressDetail || "");
          setPostalCode(data.user.postalCode || "");
        }
      } catch (e) {
        // اگه سشن معتبر نبود، کاربر موقع ثبت نهایی سفارش با خطای ۴۰۱ مواجه می‌شه و راهنمایی می‌شه
      } finally {
        setPageLoading(false);
      }
    })();
  }, [loadCart]);

  const updateQuantity = async (cartItem, nextQuantity) => {
    const step = cartItem.product?.step || DEFAULT_PRODUCT_STEP;
    const stock = cartItem.product?.stock;

    if (nextQuantity < step) return;
    if (typeof stock === "number" && nextQuantity > stock) {
      toast.error("به موجودی محصول رسیدید.", { theme: "dark" });
      return;
    }

    const prevCart = cart;
    setPendingItemId(cartItem.id);
    // آپدیت خوش‌بینانه برای حس سریع بودن UI
    setCart((c) => ({
      ...c,
      items: c.items.map((it) => (it.id === cartItem.id ? { ...it, quantity: nextQuantity } : it)),
    }));

    try {
      const res = await fetch(`/api/cart/${cartItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: nextQuantity }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "خطا در ویرایش سبد خرید");
      await loadCart(); // برای گرفتن total به‌روز شده از سرور
    } catch (err) {
      setCart(prevCart); // rollback در صورت خطا (مثلاً موجودی کافی نیست)
      toast.error(err.message, { theme: "dark" });
    } finally {
      setPendingItemId(null);
    }
  };

  const removeItem = async (cartItem) => {
    const prevCart = cart;
    setPendingItemId(cartItem.id);
    setCart((c) => ({ ...c, items: c.items.filter((it) => it.id !== cartItem.id) }));

    try {
      const res = await fetch(`/api/cart/${cartItem.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "خطا در حذف از سبد خرید");
      await loadCart();
    } catch (err) {
      setCart(prevCart);
      toast.error(err.message, { theme: "dark" });
    } finally {
      setPendingItemId(null);
    }
  };

  const handleCheckout = async () => {
    if (!recipientName.trim() || !recipientPhone.trim() || !shippingAddress.trim() || !postalCode.trim()) {
      toast.error("لطفاً اطلاعات گیرنده را کامل کنید.", { theme: "dark" });
      return;
    }
    if (!/^09\d{9}$/.test(recipientPhone)) {
      toast.error("شماره تماس گیرنده معتبر نیست.", { theme: "dark" });
      return;
    }
    if (!/^\d{10}$/.test(postalCode)) {
      toast.error("کد پستی باید دقیقاً ۱۰ رقم باشد.", { theme: "dark" });
      return;
    }

    setCheckoutLoading(true);

    try {
      const items = cart.items.map((item) =>
        item.itemType === "PRODUCT"
          ? { itemType: "PRODUCT", productId: item.productId, quantity: item.quantity }
          : { itemType: "COURSE", courseId: item.courseId, quantity: 1 }
      );

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
          shippingAddress: shippingAddress.trim(),
          postalCode: postalCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید.", { theme: "dark" });
          window.location.href = "/login";
          return;
        }
        throw new Error(data.error || "خطا در ثبت سفارش");
      }

      toast.success("سفارش شما با موفقیت ثبت شد!", { theme: "dark" });
      // سبد خرید باید داخل خودِ POST /api/orders (همون تراکنشی که سفارش ساخته میشه) پاک بشه؛
      // اینجا فقط برای بازخورد فوریِ UI صفرش می‌کنیم
      setCart({ items: [], total: 0 });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      toast.error(err.message, { theme: "dark" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatToman = (n) => `${Number(n || 0).toLocaleString()} تومان`;

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-[#0b0b0c] px-4 py-12 text-white flex items-center justify-center">
        <p className="text-gray-400">در حال بارگذاری سبد خرید...</p>
      </main>
    );
  }

  if (authed === false) {
    return (
      <main className="min-h-screen bg-[#0b0b0c] px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl flex flex-col items-center justify-center py-20 border border-white/10 bg-[#151516]/80 rounded-3xl">
          <p className="text-gray-400 mb-6">برای مشاهده سبد خرید ابتدا وارد حساب کاربری خود شوید.</p>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-[#CD9F63] text-[#111] px-6 py-3 rounded-xl font-bold hover:bg-white transition-all"
          >
            <FaSignInAlt />
            <span>ورود به حساب کاربری</span>
          </Link>
        </div>
      </main>
    );
  }

  const items = cart?.items || [];

  return (
    <main className="min-h-screen bg-[#0b0b0c] px-4 py-12 text-white">
      <ToastContainer />
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <FaShoppingBasket className="text-[#CD9F63]" />
          سبد خرید شما
        </h1>

        {items.length === 0 ? (
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
            {/* لیست آیتم‌های سبد خرید */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const isProduct = item.itemType === "PRODUCT";
                const info = isProduct ? item.product : item.course;
                const isPending = pendingItemId === item.id;
                const step = info?.step || DEFAULT_PRODUCT_STEP;

                // اگه محصول/دوره از دیتابیس حذف شده باشه (relation SetNull خورده)، از نمایش رد شو
                if (!info) return null;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border border-white/10 bg-[#151516]/80 p-5 rounded-2xl backdrop-blur-xl"
                  >
                    <div>
                      <h3 className="font-bold text-lg mb-1">{info.title}</h3>
                      {isProduct ? (
                        <p className="text-xs text-gray-400">{info.category}</p>
                      ) : (
                        <p className="text-xs text-gray-400">مدرس: {info.instructor}</p>
                      )}
                      <span className="text-sm font-bold text-[#CD9F63] mt-3 inline-block">
                        {formatToman(info.price)}
                        {isProduct && info.unitType && ` / ${info.unitType === "gram" ? "گرم" : info.unitType}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {isProduct && (
                        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-2 py-1">
                          <button
                            disabled={isPending || item.quantity - step < step}
                            onClick={() => updateQuantity(item, item.quantity - step)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all cursor-pointer disabled:opacity-40"
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <span className="text-xs w-12 text-center">{item.quantity}</span>
                          <button
                            disabled={isPending || item.quantity + step > info.stock}
                            onClick={() => updateQuantity(item, item.quantity + step)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all cursor-pointer disabled:opacity-40"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>
                      )}
                      <button
                        disabled={isPending}
                        onClick={() => removeItem(item)}
                        className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                        title="حذف"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* اطلاعات گیرنده + فاکتور */}
            <div className="space-y-6">
              <div className="border border-white/10 bg-[#151516]/80 p-6 rounded-3xl backdrop-blur-xl">
                <h2 className="text-lg font-bold mb-4 border-b border-white/10 pb-3">اطلاعات گیرنده</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="نام و نام خانوادگی گیرنده"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-right outline-none focus:border-[#CD9F63]"
                    disabled={checkoutLoading}
                  />
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="شماره تماس گیرنده"
                    maxLength={11}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-left outline-none focus:border-[#CD9F63]"
                    disabled={checkoutLoading}
                  />
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="کد پستی (۱۰ رقم)"
                    maxLength={10}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-left outline-none focus:border-[#CD9F63]"
                    disabled={checkoutLoading}
                  />
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="آدرس دقیق پستی"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-right outline-none focus:border-[#CD9F63] resize-none"
                    disabled={checkoutLoading}
                  />
                </div>
              </div>

              <div className="border border-white/10 bg-[#151516]/80 p-6 rounded-3xl h-fit backdrop-blur-xl">
                <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-4">خلاصه سفارش</h2>
                <div className="flex justify-between mb-6 text-sm text-gray-300">
                  <span>مجموع اقلام:</span>
                  <span>{items.length} قلم</span>
                </div>
                <div className="flex justify-between mb-8 text-lg font-bold">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-[#CD9F63]">{formatToman(cart?.total)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-[#CD9F63] text-[#111] py-3 rounded-xl font-bold hover:bg-white transition-all cursor-pointer disabled:opacity-50"
                >
                  {checkoutLoading ? "در حال ثبت سفارش..." : "تایید و ثبت نهایی سفارش"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}