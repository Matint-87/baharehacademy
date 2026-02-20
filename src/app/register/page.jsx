"use client"
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, Toaster } from "react-hot-toast";
import Link from "next/link";

export default function Register() {
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(120);

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const formik = useFormik({
    initialValues: { full_name: "", mobile: "", otp: "" },
    validationSchema: Yup.object({
      full_name: Yup.string().required("نام و نام خانوادگی الزامی است"),
      mobile: Yup.string().matches(/^09\d{9}$/, "شماره موبایل معتبر نیست").required("شماره موبایل الزامی است"),
      otp: Yup.string().length(6, "کد تایید باید ۶ رقمی باشد")
    }),
    onSubmit: async (values) => {
      if (step === 1) {
        const res = await fetch("/api/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: values.mobile, full_name: values.full_name })
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(data.message);
          setStep(2);
          setTimer(120);
        } else {
          toast.error(data.error);
        }
      } else if (step === 2) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: values.mobile, full_name: values.full_name, otp: values.otp })
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(data.message);
        } else {
          toast.error(data.error);
        }
      }
    }
  });

  const handleBack = () => {
    setStep(1);
    formik.setFieldValue('otp', '');
  };

  const handleResend = async () => {
    setTimer(120);
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: formik.values.mobile, full_name: formik.values.full_name })
    });
    const data = await res.json();
    if (res.ok) toast.success("کد جدید ارسال شد");
    return data;
  };

  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2,"0");
    const s = String(sec % 60).padStart(2,"0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-l from-[#E24257] to-[#ac3242] p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">ثبت‌نام در سایت</h1>
          <p className="text-white/80 text-sm mt-1">برای ثبت‌نام، اطلاعات زیر را وارد کنید</p>
        </div>

        <div className="p-6">
          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">نام و نام خانوادگی</label>
                <input
                  name="full_name"
                  placeholder="مثال: علی محمدی"
                  value={formik.values.full_name}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E24257] focus:border-[#E24257] outline-none"
                />
                {formik.touched.full_name && formik.errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">شماره موبایل</label>
                <input
                  name="mobile"
                  placeholder="09123456789"
                  value={formik.values.mobile}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E24257] focus:border-[#E24257] outline-none"
                  dir="ltr"
                />
                {formik.touched.mobile && formik.errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.mobile}</p>
                )}
              </div>

              <button type="submit" className="w-full bg-[#E24257] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#C22A3D] transition-colors mt-6">
                دریافت کد تایید
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="text-center">
                <input
                  name="otp"
                  placeholder="کد ۶ رقمی"
                  value={formik.values.otp}
                  onChange={formik.handleChange}
                  className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E24257] focus:border-[#E24257] outline-none"
                  maxLength={6}
                  dir="ltr"
                />
                {formik.touched.otp && formik.errors.otp && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.otp}</p>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 text-sm">
                <div className="text-gray-600">
                  <span>{formatTimer(timer)}</span>
                  <span> مانده</span>
                </div>
                <button type="button" onClick={handleResend} disabled={timer>0} className={`${timer>0 ? "text-gray-400 cursor-not-allowed" : "text-[#E24257] hover:text-[#C22A3D]"} font-bold`}>
                  ارسال مجدد کد
                </button>
              </div>

              <button type="submit" className="w-full bg-[#E24257] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#C22A3D] transition-colors">
                تایید و ثبت‌نام
              </button>

              <button type="button" onClick={handleBack} className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors">
                بازگشت
              </button>
            </form>
          )}

          {/* Login Link */}
          <div className="text-center mt-6 text-gray-600 pt-2">
            <span>حساب کاربری دارید؟ </span>
            <Link href="/login" className="text-[#E24257] hover:text-[#C22A3D] font-bold">وارد شوید</Link>
          </div>
        </div>
      </div>
    </div>
  );
}