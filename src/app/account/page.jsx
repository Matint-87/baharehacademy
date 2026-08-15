"use client";

import { useState, useEffect } from "react";
import { FaUser, FaMapMarkerAlt, FaMailBulk, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

const editSchema = Yup.object({
  firstName: Yup.string().required("لطفاً نام خود را وارد کنید."),
  lastName: Yup.string().required("لطفاً نام خانوادگی خود را وارد کنید."),
  postalCode: Yup.string()
    .matches(/^[0-9]{10}$/, "کد پستی باید دقیقاً ۱۰ رقم باشد.")
    .required("لطفاً کد پستی را وارد کنید."),
  address: Yup.string().required("لطفاً آدرس دقیق پستی را وارد کنید."),
});

function AccountPage() {
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const formik = useFormik({
    initialValues: { firstName: "", lastName: "", address: "", postalCode: "" },
    validationSchema: editSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/update-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("نشست شما منقضی شده. لطفاً دوباره وارد شوید.");
            window.location.href = "/login";
            return;
          }
          throw new Error(data.error || "خطا در ذخیره اطلاعات.");
        }

        toast.success("اطلاعات شما با موفقیت به‌روزرسانی شد! 🎉");
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

        // اگه هنوز ثبت‌نامش کامل نشده (پسورد نداره)، باید بره صفحه‌ی تکمیل ثبت‌نام
        if (!data.user.hasPassword) {
          window.location.href = "/profile";
          return;
        }

        formik.setValues({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          address: data.user.address || "",
          postalCode: data.user.postalCode || "",
        });
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
            <h1 className="text-2xl font-bold text-white">ویرایش اطلاعات حساب کاربری</h1>
            <p className="mt-3 text-sm text-gray-500">می‌توانید نام، آدرس و کد پستی خود را در هر زمان به‌روزرسانی کنید.</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-right text-sm text-gray-400">نام</label>
                <div
                  className={`flex items-center gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                    formik.touched.firstName && formik.errors.firstName
                      ? "border-red-500/70"
                      : "border-white/10 focus-within:border-[#CD9F63]/70"
                  }`}
                >
                  <FaUser className="shrink-0 text-[#CD9F63]" />
                  <input
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full bg-transparent text-right text-sm text-white outline-none"
                    disabled={loading}
                  />
                </div>
                {formik.touched.firstName && formik.errors.firstName && (
                  <span className="mt-1 block text-right text-[11px] text-red-400">{formik.errors.firstName}</span>
                )}
              </div>

              <div>
                <label className="mb-2 block text-right text-sm text-gray-400">نام خانوادگی</label>
                <div
                  className={`flex items-center gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                    formik.touched.lastName && formik.errors.lastName
                      ? "border-red-500/70"
                      : "border-white/10 focus-within:border-[#CD9F63]/70"
                  }`}
                >
                  <FaUser className="shrink-0 text-[#CD9F63]" />
                  <input
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full bg-transparent text-right text-sm text-white outline-none"
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
              <div
                className={`flex items-center gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                  formik.touched.postalCode && formik.errors.postalCode
                    ? "border-red-500/70"
                    : "border-white/10 focus-within:border-[#CD9F63]/70"
                }`}
              >
                <FaMailBulk className="shrink-0 text-[#CD9F63]" />
                <input
                  name="postalCode"
                  value={formik.values.postalCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  maxLength={10}
                  className="w-full bg-transparent text-left text-sm text-white outline-none"
                  disabled={loading}
                />
              </div>
              {formik.touched.postalCode && formik.errors.postalCode && (
                <span className="mt-1 block text-right text-[11px] text-red-400">{formik.errors.postalCode}</span>
              )}
            </div>

            <div>
              <label className="mb-2 block text-right text-sm text-gray-400">آدرس دقیق پستی</label>
              <div
                className={`flex items-start gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                  formik.touched.address && formik.errors.address
                    ? "border-red-500/70"
                    : "border-white/10 focus-within:border-[#CD9F63]/70"
                }`}
              >
                <FaMapMarkerAlt className="mt-1 shrink-0 text-[#CD9F63]" />
                <textarea
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                  className="w-full resize-none bg-transparent text-right text-sm text-white outline-none"
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
              {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default AccountPage;