"use client";

import { useState, useEffect } from "react";
import { FaUser, FaMapMarkerAlt, FaMailBulk, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

const profileSchema = Yup.object({
  firstName: Yup.string().required("لطفاً نام خود را وارد کنید."),
  lastName: Yup.string().required("لطفاً نام خانوادگی خود را وارد کنید."),
  postalCode: Yup.string()
    .matches(/^[0-9]{10}$/, "کد پستی باید دقیقاً ۱۰ رقم باشد.")
    .required("لطفاً کد پستی را وارد کنید."),
  address: Yup.string().required("لطفاً آدرس دقیق پستی را وارد کنید."),
});

function ProfilePage() {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      address: "",
      postalCode: "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        // userId دیگه از فرانت فرستاده نمی‌شه؛ سرور کاربر رو از روی کوکی سشن تشخیص می‌ده
        const response = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          // اگه سشن منقضی شده یا اصلاً وجود نداره، برگردون به صفحه‌ی ورود
          if (response.status === 401) {
            toast.error("نشست شما منقضی شده. لطفاً دوباره وارد شوید.");
            window.location.href = "/login";
            return;
          }
          throw new Error(data.error || "خطا در ذخیره اطلاعات.");
        }

        toast.success("اطلاعات پروفایل با موفقیت ثبت شد! 🍳");

        // این localStorage فقط برای نمایش سریع اطلاعات توی UI استفاده می‌شه
        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);

      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    // این فقط برای پیش‌پر کردن فرم با اطلاعات قبلیه (تجربه‌ی کاربری)،
    // نه چک امنیتی. اگه سشن معتبر نباشه، خود درخواست POST با ۴۰۱ رد می‌شه
    // و اونجا به لاگین هدایت می‌شیم. برای جلوگیری کامل از دسترسی افراد میهمان
    // به این صفحه، بهتره یک middleware.js هم سمت سرور اضافه کنی.
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);

        formik.setValues({
          firstName: userObj.firstName || "",
          lastName: userObj.lastName || "",
          address: userObj.address || userObj.addressDetail || "",
          postalCode: userObj.postalCode || "",
        });
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0b0b0c] px-4 py-10">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#CD9F63]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#CD9F63]/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-xl">
        <div className="rounded-3xl border border-white/10 bg-[#151516]/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-9">
          
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">تکمیل اطلاعات حساب کاربری</h1>
            <p className="mt-3 text-sm text-gray-500">
              برای ثبت سفارشات و ارسال دوره‌های آکادمی آشپزی، اطلاعات خود را وارد کنید.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-right text-sm text-gray-400">نام</label>
                <div className={`flex items-center gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                  formik.touched.firstName && formik.errors.firstName ? "border-red-500/70" : "border-white/10 focus-within:border-[#CD9F63]/70"
                }`}>
                  <FaUser className="shrink-0 text-[#CD9F63]" />
                  <input
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="مثال: علی"
                    className="w-full bg-transparent text-right text-sm text-white outline-none placeholder:text-gray-600"
                    disabled={loading}
                  />
                </div>
                {formik.touched.firstName && formik.errors.firstName && (
                  <span className="mt-1 block text-right text-[11px] text-red-400">{formik.errors.firstName}</span>
                )}
              </div>

              <div>
                <label className="mb-2 block text-right text-sm text-gray-400">نام خانوادگی</label>
                <div className={`flex items-center gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                  formik.touched.lastName && formik.errors.lastName ? "border-red-500/70" : "border-white/10 focus-within:border-[#CD9F63]/70"
                }`}>
                  <FaUser className="shrink-0 text-[#CD9F63]" />
                  <input
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="مثال: رضایی"
                    className="w-full bg-transparent text-right text-sm text-white outline-none placeholder:text-gray-600"
                    disabled={loading}
                  />
                </div>
                {formik.touched.lastName && formik.errors.lastName && (
                  <span className="mt-1 block text-right text-[11px] text-red-400">{formik.errors.lastName}</span>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-right text-sm text-gray-400">کد پستی (۱۰ رقم)</label>
              <div className={`flex items-center gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                formik.touched.postalCode && formik.errors.postalCode ? "border-red-500/70" : "border-white/10 focus-within:border-[#CD9F63]/70"
              }`}>
                <FaMailBulk className="shrink-0 text-[#CD9F63]" />
                <input
                  name="postalCode"
                  value={formik.values.postalCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={10}
                  placeholder="1234567890"
                  className="w-full bg-transparent text-left text-sm text-white outline-none placeholder:text-gray-600"
                  disabled={loading}
                />
              </div>
              {formik.touched.postalCode && formik.errors.postalCode && (
                <span className="mt-1 block text-right text-[11px] text-red-400">{formik.errors.postalCode}</span>
              )}
            </div>

            <div>
              <label className="mb-2 block text-right text-sm text-gray-400">آدرس دقیق پستی</label>
              <div className={`flex items-start gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                formik.touched.address && formik.errors.address ? "border-red-500/70" : "border-white/10 focus-within:border-[#CD9F63]/70"
              }`}>
                <FaMapMarkerAlt className="mt-1 shrink-0 text-[#CD9F63]" />
                <textarea
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                  placeholder="استان، شهر، خیابان، پلاک، واحد..."
                  className="w-full resize-none bg-transparent text-right text-sm text-white outline-none placeholder:text-gray-600"
                  disabled={loading}
                />
              </div>
              {formik.touched.address && formik.errors.address && (
                <span className="mt-1 block text-right text-[11px] text-red-400">{formik.errors.address}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-[#CD9F63] py-3.5 text-sm font-bold text-[#111111] transition-all hover:bg-[#dcb078] disabled:opacity-50"
            >
              <FaSave />
              {loading ? "در حال ذخیره..." : "ذخیره و ادامه"}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}

export default ProfilePage;