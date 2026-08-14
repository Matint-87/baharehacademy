"use client";

import { useState } from "react";
import { FaArrowLeft, FaMobileAlt, FaShieldAlt, FaKey } from "react-icons/fa";
import { toast } from "react-toastify";

function Login() {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [devHint, setDevHint] = useState("");

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setMobile(value);
    if (errorMessage) setErrorMessage("");
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setOtpCode(value);
    if (errorMessage) setErrorMessage("");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (mobile.length !== 11 || !mobile.startsWith("09")) {
      const msg = "لطفاً یک شماره موبایل معتبر ۱۱ رقمی وارد کنید.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: mobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطایی در ارسال کد تایید رخ داد.");
      }

      // devOtpCode فقط توی محیط dev از سرور برمی‌گرده، پس نباید بدون چک بهش تکیه کنیم
      if (data.devOtpCode) {
        setDevHint(data.devOtpCode);
        toast.success(`کد تایید ارسال شد! (کد تست: ${data.devOtpCode})`);
      } else {
        toast.success("کد تایید ارسال شد!");
      }

      setStep(2);
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      const msg = "کد تایید باید ۶ رقمی باشد.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: mobile, otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "کد تایید نامعتبر است.");
      }

      toast.success("ورود با موفقیت انجام شد! 🎉");

      // نکته: سشن واقعی از طریق کوکی httpOnly توسط سرور ست شده.
      // این localStorage فقط برای نمایش سریع اطلاعات کاربر (نام و ...) توی UI استفاده می‌شه،
      // نه برای تصمیم‌گیری امنیتی - آن کار باید سمت سرور (middleware/session) انجام بشه.
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        if (!data.user.firstName || !data.user.address) {
          window.location.href = "/profile";
        } else {
          window.location.href = "/";
        }
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0b0b0c] px-4 py-10">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#CD9F63]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#CD9F63]/5 blur-[120px]" />

      <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full bg-linear-to-r from-transparent via-[#CD9F63]/10 to-transparent" />

      <div className="relative z-10 w-full max-w-[430px]">
        <div className="rounded-3xl border border-white/10 bg-[#151516]/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-9">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">
              {step === 1 ? "ورود به حساب کاربری" : "تایید کد احراز هویت"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              {step === 1
                ? "برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید."
                : `کد تایید ۶ رقمی به شماره ${mobile} ارسال شد.`}
            </p>
            {step === 2 && devHint && (
              <div className="mt-2 inline-block rounded-lg bg-[#CD9F63]/10 px-3 py-1 text-xs text-[#CD9F63]">
                کد تست برای شما: <b>{devHint}</b>
              </div>
            )}
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
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
                    disabled={loading}
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs text-red-400 text-right">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#CD9F63] py-3.5 text-sm font-bold text-[#111111] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#dcb078] hover:shadow-[0_10px_30px_rgba(205,159,99,0.18)] disabled:opacity-50"
              >
                {loading ? "در حال ارسال..." : "ادامه"}
                {!loading && (
                  <FaArrowLeft className="text-xs transition-transform duration-300 group-hover:-translate-x-1" />
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <div>
                <label className="mb-2 flex items-center justify-between text-sm text-gray-400">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtpCode("");
                    }}
                    className="text-xs text-[#CD9F63] hover:underline"
                  >
                    ویرایش شماره
                  </button>
                  <span>کد تایید ۶ رقمی</span>
                </label>
                <div className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f0f10] px-4 py-3 transition-all duration-300 focus-within:border-[#CD9F63]/70 focus-within:shadow-[0_0_20px_rgba(205,159,99,0.08)]">
                  <FaKey className="shrink-0 text-[#CD9F63]" />
                  <input
                    name="otp"
                    value={otpCode}
                    onChange={handleOtpChange}
                    className="w-full bg-transparent text-center tracking-widest text-lg text-white outline-none placeholder:text-gray-600"
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="------"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs text-red-400 text-right">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#CD9F63] py-3.5 text-sm font-bold text-[#111111] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#dcb078] hover:shadow-[0_10px_30px_rgba(205,159,99,0.18)] disabled:opacity-50"
              >
                {loading ? "در حال بررسی..." : "تایید و ورود"}
              </button>
            </form>
          )}

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