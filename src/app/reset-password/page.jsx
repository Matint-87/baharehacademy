"use client";

import { useState, useEffect } from "react";
import { FaLock, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const resetSchema = Yup.object({
  password: Yup.string()
    .matches(PASSWORD_REGEX, "رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.")
    .required("لطفاً رمز عبور جدید را وارد کنید."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "تکرار رمز عبور مطابقت ندارد.")
    .required("لطفاً رمز عبور را تکرار کنید."),
});

function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const formik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: resetSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await fetch("/api/auth/set-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: values.password }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            toast.error("نشست شما منقضی شده. لطفاً دوباره وارد شوید.");
            window.location.href = "/login";
            return;
          }
          throw new Error(data.error || "خطا در تغییر رمز عبور.");
        }

        toast.success("رمز عبور شما با موفقیت تغییر کرد! 🎉");
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
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        window.location.href = "/login";
        return;
      }
      setCheckingSession(false);
    })();
  }, []);

  if (checkingSession) return null;

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0b0b0c] px-4 py-10">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#CD9F63]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#CD9F63]/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[430px]">
        <div className="rounded-3xl border border-white/10 bg-[#151516]/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-9">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">تعیین رمز عبور جدید</h1>
            <p className="mt-3 text-sm text-gray-500">هویت شما تایید شد. رمز عبور جدید خود را وارد کنید.</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="mb-2 block text-right text-sm text-gray-400">رمز عبور جدید</label>
              <div
                className={`flex items-center gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500/70"
                    : "border-white/10 focus-within:border-[#CD9F63]/70"
                }`}
              >
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
                  autoFocus
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <span className="mt-1 block text-right text-[11px] text-red-400">{formik.errors.password}</span>
              )}
            </div>

            <div>
              <label className="mb-2 block text-right text-sm text-gray-400">تکرار رمز عبور</label>
              <div
                className={`flex items-center gap-3 rounded-xl border bg-[#0f0f10] px-4 py-3 transition-colors ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? "border-red-500/70"
                    : "border-white/10 focus-within:border-[#CD9F63]/70"
                }`}
              >
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

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#CD9F63] py-3.5 text-sm font-bold text-[#111111] transition-all hover:bg-[#dcb078] disabled:opacity-50"
            >
              <FaSave />
              {loading ? "در حال ذخیره..." : "ذخیره رمز عبور جدید"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;