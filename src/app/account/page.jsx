"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FiBookOpen,
  FiShoppingBag,
  FiSettings,
  FiLogOut,
  FiAward,
  FiXCircle,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiMapPin,
  FiMail,
  FiSave,
} from "react-icons/fi";

const orderStatusMap = {
  PENDING_PAYMENT: {
    label: "در انتظار پرداخت",
    color: "bg-[#CD9F63]/10 text-[#CD9F63] border-[#CD9F63]/20",
  },
  PAID: {
    label: "پرداخت شده",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  PROCESSING: {
    label: "در حال پردازش",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  SHIPPED: {
    label: "ارسال شده",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  DELIVERED: {
    label: "تحویل داده شده",
    color: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  },
  CANCELLED: {
    label: "لغو شده",
    color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
};

export default function UserProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("courses");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [courses, setCourses] = useState([]);
  // تنظیمات فرم پروفایل
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    postalCode: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // لغو سفارش
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        // ۱. گرفتن اطلاعات کاربر لاگین شده
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/login");
          return;
        }
        const authData = await authRes.json();
        const currentUser = authData?.user || authData;
        setUser(currentUser);
        setFormData({
          firstName: currentUser.firstName || "",
          lastName: currentUser.lastName || "",
          address: currentUser.address || currentUser.addressDetail || "",
          postalCode: currentUser.postalCode || "",
        });

        const userId = currentUser.id;

        // ۲. گرفتن سفارشات کاربر بر اساس اسکیما Order
        const ordersRes = await fetch(`/api/user/orders?userId=${userId}`);
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.orders || []);

          // ۳. استخراج دوره‌ها از داخل سفارشات ثبت شده
          const userCourses = [];
          ordersData.orders?.forEach((order) => {
            order.items?.forEach((item) => {
              if (item.course) {
                userCourses.push({
                  ...item.course,
                  orderStatus: order.status,
                  purchaseDate: order.createdAt,
                });
              }
            });
          });
          setCourses(userCourses);
        }
      } catch (err) {
        console.error("خطا در دریافت اطلاعات:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

  // خروج از حساب کاربری
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Error during logout:", e);
    } finally {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  // ذخیره تنظیمات حساب کاربری
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/auth/update-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert("اطلاعات با موفقیت به‌روزرسانی شد.");
      } else {
        alert(data.error || "خطا در ذخیره اطلاعات");
      }
    } catch (err) {
      console.error(err);
      alert("خطا در ارتباط با سرور");
    } finally {
      setSavingSettings(false);
    }
  };

  // ثبت لغو سفارش
  const handleCancelOrder = async (orderId) => {
    if (!cancelReason.trim()) {
      alert("لطفاً دلیل لغو سفارش را وارد کنید.");
      return;
    }

    try {
      const res = await fetch(`/api/orders/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason: cancelReason }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(
          orders.map((o) =>
            o.id === orderId ? { ...o, status: "CANCELLED" } : o,
          ),
        );
        setCancellingOrderId(null);
        setCancelReason("");
        alert("سفارش با موفقیت لغو شد.");
      } else {
        alert(data.error || "امکان لغو این سفارش وجود ندارد.");
      }
    } catch (err) {
      console.error(err);
      alert("خطا در ارتباط با سرور");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d0d0e] text-white gap-3">
        <div className="w-6 h-6 border-2 border-[#CD9F63] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-gray-400">
          در حال بارگذاری اطلاعات پنل...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0e] text-white dir-rtl text-right py-8 px-4">
      <div className="max-w-[1080px] 2xl:max-w-6xl mx-auto space-y-6">
        {/* هدر حساب کاربری */}
        <div className="bg-[#151516] border border-white/10 p-6 rounded-2xl flex justify-between items-center gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#CD9F63]/10 border border-[#CD9F63]/20 flex items-center justify-center text-[#CD9F63] text-xl font-bold">
              {user?.firstName ? user.firstName[0] : <FiUser />}
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold">
                سلام،{" "}
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : "کاربر گرامی"}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5" dir="ltr">
                {user?.phoneNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* منوی تب‌ها (سایدبار) */}
          <div className="md:col-span-1 bg-[#151516] border border-white/10 p-3 rounded-2xl flex md:flex-col gap-2 overflow-x-auto h-fit [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setActiveTab("courses")}
              className={`w-full flex items-center gap-2.5 text-right px-4 py-3 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                activeTab === "courses"
                  ? "bg-[#CD9F63] text-black font-bold shadow-md"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <FiBookOpen className="shrink-0 text-base" />
              دوره‌های من
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-2.5 text-right px-4 py-3 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                activeTab === "orders"
                  ? "bg-[#CD9F63] text-black font-bold shadow-md"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <FiShoppingBag className="shrink-0 text-base" />
              سفارش‌های من
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-2.5 text-right px-4 py-3 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                activeTab === "settings"
                  ? "bg-[#CD9F63] text-black font-bold shadow-md"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <FiSettings className="shrink-0 text-base" />
              تنظیمات حساب کاربری
            </button>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2.5 px-4 py-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-medium hover:bg-rose-500/20 transition whitespace-nowrap md:w-full"
            >
              <FiLogOut />
              خروج از حساب
            </button>
          </div>

          {/* محتوای اصلی تب‌ها */}
          <div className="md:col-span-3 bg-[#151516] border border-white/10 p-6 rounded-2xl shadow-lg">
            {/* تب ۱: دوره‌های من */}
            {activeTab === "courses" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold mb-4 border-b border-white/5 pb-2 text-[#CD9F63]">
                  دوره‌های ثبت‌نام شده
                </h2>
                {courses.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">
                    شما هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید.
                  </p>
                ) : (
                  courses.map((course, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0d0d0e] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-gray-200">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-400">
                          مدرس: {course.instructor || "نامشخص"} | مدت زمان:{" "}
                          {course.duration || "-"}
                        </p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-md">
                          {course.orderStatus === "DELIVERED" ? (
                            <FiCheckCircle />
                          ) : (
                            <FiClock />
                          )}
                          {course.orderStatus === "DELIVERED"
                            ? "تکمیل شده / قابل دسترسی"
                            : "در حال گذراندن"}
                        </span>
                      </div>

                      {/* بخش مدرک */}
                      <div>
                        {course.orderStatus === "DELIVERED" ? (
                          <button
                            onClick={() =>
                              alert(
                                `مدرک دوره ${course.title} آماده دانلود است.`,
                              )
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition"
                          >
                            <FiAward />
                            دریافت مدرک
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-500">
                            مدرک پس از پایان دوره فعال می‌شود
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* تب ۲: سفارش‌های من */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold mb-4 border-b border-white/5 pb-2 text-[#CD9F63]">
                  سفارش‌های جاری و تحویل داده شده
                </h2>
                {orders.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-8">
                    سفارشی ثبت نشده است.
                  </p>
                ) : (
                  orders.map((order) => {
                    const statusInfo = orderStatusMap[order.status] || {
                      label: order.status,
                      color: "bg-gray-500/10 text-gray-300",
                    };
                    const isJari = [
                      "PENDING_PAYMENT",
                      "PAID",
                      "PROCESSING",
                      "SHIPPED",
                    ].includes(order.status);

                    return (
                      <div
                        key={order.id}
                        className="bg-[#0d0d0e] border border-white/5 p-4 rounded-xl space-y-3"
                      >
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <span className="text-xs font-mono text-[#CD9F63]">
                            سفارش: #{order.id.slice(-8)}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="text-xs text-gray-300 space-y-1">
                          <p>
                            مبلغ کل:{" "}
                            <span className="font-bold text-white">
                              {(order.totalAmount || 0).toLocaleString()} تومان
                            </span>
                          </p>
                          <p className="text-gray-400">
                            آدرس تحویل: {order.shippingAddress}
                          </p>
                        </div>

                        {/* لیست اقلام سفارش */}
                        <div className="border-t border-white/5 pt-2 space-y-1">
                          <p className="text-[11px] text-gray-400 font-bold">
                            اقلام سفارش:
                          </p>
                          {order.items?.map((item, i) => (
                            <div
                              key={i}
                              className="text-xs text-gray-300 flex justify-between"
                            >
                              <span>
                                •{" "}
                                {item.titleSnapshot ||
                                  item.course?.title ||
                                  item.product?.title}{" "}
                                (تعداد: {item.quantity})
                              </span>
                              <span>
                                {(item.unitPrice || 0).toLocaleString()} تومان
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* گزینه لغو سفارش برای سفارش‌های جاری */}
                        {isJari && (
                          <div className="border-t border-white/5 pt-3 mt-2 flex flex-col gap-2">
                            {cancellingOrderId === order.id ? (
                              <div className="space-y-2 bg-[#151516] p-3 rounded-xl border border-white/10">
                                <label className="block text-xs text-rose-400">
                                  لطفاً دلیل لغو سفارش را وارد کنید:
                                </label>
                                <input
                                  type="text"
                                  placeholder="مثلاً: انصراف از خرید..."
                                  value={cancelReason}
                                  onChange={(e) =>
                                    setCancelReason(e.target.value)
                                  }
                                  className="w-full px-3 py-2 bg-[#0d0d0e] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => setCancellingOrderId(null)}
                                    className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-xs"
                                  >
                                    انصراف
                                  </button>
                                  <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold"
                                  >
                                    تایید و لغو نهایی
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <button
                                  onClick={() => setCancellingOrderId(order.id)}
                                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition font-medium"
                                >
                                  <FiXCircle />
                                  درخواست لغو این سفارش
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* تب ۳: تنظیمات حساب کاربری */}
            {activeTab === "settings" && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold mb-4 border-b border-white/5 pb-2 text-[#CD9F63]">
                  ویرایش اطلاعات حساب کاربری
                </h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        نام
                      </label>
                      <div className="flex items-center gap-2 bg-[#0d0d0e] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#CD9F63]">
                        <FiUser className="text-[#CD9F63] shrink-0" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full bg-transparent text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        نام خانوادگی
                      </label>
                      <div className="flex items-center gap-2 bg-[#0d0d0e] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#CD9F63]">
                        <FiUser className="text-[#CD9F63] shrink-0" />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full bg-transparent text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      آدرس دقیق پستی
                    </label>
                    <div className="flex items-start gap-2 bg-[#0d0d0e] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#CD9F63]">
                      <FiMapPin className="text-[#CD9F63] shrink-0 mt-0.5" />
                      <textarea
                        rows="2"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full bg-transparent text-xs text-white focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      کد پستی
                    </label>
                    <div className="flex items-center gap-2 bg-[#0d0d0e] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#CD9F63]">
                      <FiMail className="text-[#CD9F63] shrink-0" />
                      <input
                        type="text"
                        maxLength={10}
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postalCode: e.target.value,
                          })
                        }
                        className="w-full bg-transparent text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#CD9F63] text-black font-bold text-xs rounded-xl transition shadow-md hover:bg-[#b88c53] disabled:opacity-50"
                  >
                    <FiSave />
                    {savingSettings ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
