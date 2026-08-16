"use client";

import { useState, useEffect } from "react";
import { FaUser, FaMapMarkerAlt, FaMailBulk, FaSave, FaLock, FaIdCard, FaCalendarAlt, FaImage } from "react-icons/fa";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

// حداقل ۸ کاراکتر + حداقل یک حرف + یک عدد
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const profileSchema = Yup.object({
  firstName: Yup.string().required("لطفاً نام خود را وارد کنید."),
  lastName: Yup.string().required("لطفاً نام خانوادگی خود را وارد کنید."),
  postalCode: Yup.string()
    .matches(/^[0-9]{10}$/, "کد پستی باید دقیقاً ۱۰ رقم باشد.")
    .required("لطفاً کد پستی را وارد کنید."),
  addressDetail: Yup.string().required("لطفاً آدرس دقیق پستی را وارد کنید."),
  nationalCode: Yup.string()
    .matches(/^[0-9]{10}$/, "کد ملی باید دقیقاً ۱۰ رقم باشد.")
    .optional(),
  age: Yup.number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .positive("سن باید یک عدد مثبت باشد.")
    .integer("سن باید عدد صحیح باشد.")
    .optional(),
  image: Yup.string().url("فرمت لینک تصویر معتبر نیست.").optional(),
  password: Yup.string()
    .matches(PASSWORD_REGEX, "رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.")
    .required("لطفاً یک رمز عبور تعیین کنید."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "تکرار رمز عبور مطابقت ندارد.")
    .required("لطفاً رمز عبور را تکرار کنید."),
});

function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      addressDetail: "",
      postalCode: "",
      nationalCode: "",
      age: "",
      image: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        const response = await fetch("/api/auth/complete-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: values.firstName,
            lastName: values.lastName,
            addressDetail: values.addressDetail, // هماهنگ با Prisma
            postalCode: values.postalCode,
            nationalCode: values.nationalCode || null,
            age: values.age ? Number(values.age) : null,
            image: values.image || null,
            password: values.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("نشست شما منقضی شده. لطفاً دوباره وارد شوید.");
            window.location.href = "/login";
            return;
          }
          if (response.status === 409) {
            toast.error(data.error);
            window.location.href = "/login";
            return;
          }
          throw new Error(data.error || "خطا در ذخیره اطلاعات.");
        }

        toast.success("ثبت‌نام شما با موفقیت تکمیل شد! 🎉");
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
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        if (data.user.hasPassword) {
          window.location.href = "/";
          return;
        }
        setCheckingSession(false);
      } catch (e) {
        window.location.href = "/login";
      }
    })();
  }, []);

  if (checkingSession) return null;

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0b0b0c] px-4 py-10">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#CD9F63]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#CD9F63]/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-xl">
        <div className="rounded-3xl border border-white/10 bg-[#151516]/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-9">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">تکمیل اطلاعات حساب کاربری</h1>
            <p className="mt-3 text-sm text-gray-500">
              برای ثبت سفارشات، اطلاعات خود را کامل کنید و یک رمز عبور برای ورودهای بعدی تعیین کنید.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* نام */}
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

              {/* نام خانوادگی */}
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

            {/* کد ملی و سن (فیلدهای جدید مدل) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-right text-sm text-gray-400">کد ملی (اختیاری)</label>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f0f10] px-4 py-3 focus-within:border-[#CD9F63]/70">
                  <FaIdCard className="shrink-0 text-[#CD9F63]" />
                  <input
                    name="nationalCode"
                    value={formik.values.nationalCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    maxLength={10}
                    placeholder="۰۱۲۳۴۵۶۷۸۹"
                    className="w-full bg-transparent text-left text-sm text-white outline-none placeholder:text-gray-600"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-right text-sm text-gray-400">سن (اختیاری)</label>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f0f10] px-4 py-3 focus-within:border-[#CD9F63]/70">
                  <FaCalendarAlt className="shrink-0 text-[#CD9F63]" />
                  <input
                    name="age"
                    type="number"
                    value={formik.values.age}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="مثال: ۲۵"
                    className="w-full bg-transparent text-left text-sm text-white outline-none placeholder:text-gray-600"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* کد پستی */}
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

            {/* آدرس دقیق پستی (هماهنگ با addressDetail در دیتابیس) */}
            <div>
              <label className="mb-2 block text-right text-sm text-gray-400">آدرس دقیق پستی</label>
              <div className={`flex items-start gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                formik.touched.addressDetail && formik.errors.addressDetail ? "border-red-500/70" : "border-white/10 focus-within:border-[#CD9F63]/70"
              }`}>
                <FaMapMarkerAlt className="mt-1 shrink-0 text-[#CD9F63]" />
                <textarea
                  name="addressDetail"
                  value={formik.values.addressDetail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                  placeholder="استان، شهر، خیابان، پلاک، واحد..."
                  className="w-full resize-none bg-transparent text-right text-sm text-white outline-none placeholder:text-gray-600"
                  disabled={loading}
                />
              </div>
              {formik.touched.addressDetail && formik.errors.addressDetail && (
                <span className="mt-1 block text-right text-[11px] text-red-400">{formik.errors.addressDetail}</span>
              )}
            </div>

            {/* رمز عبور و تکرار آن */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-right text-sm text-gray-400">رمز عبور</label>
                <div className={`flex items-center gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                  formik.touched.password && formik.errors.password ? "border-red-500/70" : "border-white/10 focus-within:border-[#CD9F63]/70"
                }`}>
                  <FaLock className="shrink-0 text-[#CD9F63]" />
                  <input
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="حداقل ۸ کاراکتر، حرف و عدد"
                    className="w-full bg-transparent text-left text-sm text-white outline-none placeholder:text-gray-600"
                    disabled={loading}
                  />
                </div>
                {formik.touched.password && formik.errors.password && (
                  <span className="mt-1 block text-right text-[11px] text-red-400">{formik.errors.password}</span>
                )}
              </div>

              <div>
                <label className="mb-2 block text-right text-sm text-gray-400">تکرار رمز عبور</label>
                <div className={`flex items-center gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500/70" : "border-white/10 focus-within:border-[#CD9F63]/70"
                }`}>
                  <FaLock className="shrink-0 text-[#CD9F63]" />
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="تکرار رمز عبور"
                    className="w-full bg-transparent text-left text-sm text-white outline-none placeholder:text-gray-600"
                    disabled={loading}
                  />
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <span className="mt-1 block text-right text-[11px] text-red-400">
                    {formik.errors.confirmPassword}
                  </span>
                )}
              </div>
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