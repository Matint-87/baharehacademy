"use client";

import { useState } from "react";
import { FaArrowLeft, FaMobileAlt, FaShieldAlt } from "react-icons/fa";

function Login() {
  const [mobile, setMobile] = useState("");

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setMobile(value);
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0b0b0c] px-4 py-10">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#CD9F63]/10 blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#CD9F63]/5 blur-[120px]" />

      {/* Decorative Lines */}
      <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full bg-linear-to-r from-transparent via-[#CD9F63]/10 to-transparent" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-107.5">
        <div className="rounded-3xl border border-white/10 bg-[#151516]/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-9">
          {/* Logo / Brand */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">
              ورود به حساب کاربری
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-2 block text-right text-sm text-gray-400">
                شماره موبایل
              </label>

              <div className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f0f10] px-4 py-3 transition-all duration-300 focus-within:border-[#CD9F63]/70 focus-within:shadow-[0_0_20px_rgba(205,159,99,0.08)]">
                <FaMobileAlt className="shrink-0 text-[#CD9F63]" />

                <input
                  name="mobile"
                  value={mobile}
                  onChange={handleMobileChange}
                  className="w-full bg-transparent text-left text-sm text-white outline-none placeholder:text-gray-600"
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="09123456789"
                />
              </div>
            </div>

            <button
              type="button"
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#CD9F63] py-3.5 text-sm font-bold text-[#111111] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#dcb078] hover:shadow-[0_10px_30px_rgba(205,159,99,0.18)]"
            >
              ادامه
              <FaArrowLeft className="text-xs transition-transform duration-300 group-hover:-translate-x-1" />
            </button>
          </div>

          {/* Security */}
          <div className="mt-7 flex items-center justify-center gap-2 border-t border-white/10 pt-5 text-xs text-gray-600">
            <FaShieldAlt className="text-[#CD9F63]" />
            <span>اطلاعات شما کاملاً امن و محرمانه است</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;