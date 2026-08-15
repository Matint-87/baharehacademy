"use client";

import { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaMobileAlt, FaShieldAlt, FaKey, FaLock } from "react-icons/fa";
import { toast } from "react-toastify";

const RESEND_SECONDS = 120;

function Login() {
  // step: "phone" | "password" | "otp"
  // mode: "login" (ورود با پسورد) | "register" (ثبت‌نام با OTP) | "reset" (فراموشی پسورد)
  const [step, setStep] = useState("phone");
  const [mode, setMode] = useState(null);

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [devHint, setDevHint] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    if (resendTimer <= 0) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setResendTimer((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [resendTimer > 0]);

  const handleMobileChange = (e) => {
    setMobile(e.target.value.replace(/[^0-9]/g, ""));
    if (errorMessage) setErrorMessage("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const handleOtpChange = (e) => {
    setOtpCode(e.target.value.replace(/[^0-9]/g, ""));
    if (errorMessage) setErrorMessage("");
  };

  // ارسال کد تایید (هم برای مسیر ثبت‌نام، هم فراموشی پسورد استفاده می‌شه)
  const sendOtp = async () => {
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
        // اگه به دلیل کول‌داون رد شد، تایمر رو با همون مقدار باقی‌مونده ست کن
        if (response.status === 429 && data.waitTime) {
          setResendTimer(data.waitTime);
        }
        throw new Error(data.error || "خطایی در ارسال کد تایید رخ داد.");
      }

      if (data.devOtpCode) {
        setDevHint(data.devOtpCode);
        toast.success(`کد تایید ارسال شد! (کد تست: ${data.devOtpCode})`);
      } else {
        toast.success("کد تایید ارسال شد!");
      }

      setResendTimer(data.resendAfterSeconds || RESEND_SECONDS);
      setStep("otp");
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // مرحله‌ی اول: بررسی اینکه این شماره پسورد داره یا مسیر ثبت‌نامه
  const handlePhoneSubmit = async (e) => {
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
      const response = await fetch("/api/auth/check-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: mobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطایی رخ داد.");
      }

      if (data.hasPassword) {
        setMode("login");
        setStep("password");
        setLoading(false);
      } else {
        setMode("register");
        await sendOtp(); // خودش loading رو مدیریت می‌کنه
      }
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
      setLoading(false);
    }
  };

  // ورود با پسورد
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      const msg = "لطفاً رمز عبور را وارد کنید.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: mobile, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ورود ناموفق بود.");
      }

      toast.success("ورود با موفقیت انجام شد! 🎉");
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // کلیک روی «رمز عبور را فراموش کرده‌ام»
  const handleForgotPassword = async () => {
    setMode("reset");
    setErrorMessage("");
    await sendOtp();
  };

  // تایید کد OTP - مسیر بعدی بسته به mode فرق می‌کنه
  const handleOtpSubmit = async (e) => {
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

      toast.success("شماره موبایل تایید شد! 🎉");

      if (mode === "reset") {
        // کاربر از قبل ثبت‌نام کرده و فقط می‌خواد پسورد جدید بسازه
        window.location.href = "/reset-password";
      } else {
        // مسیر ثبت‌نام: باید بره تکمیل پروفایل + تعیین پسورد
        window.location.href = "/profile";
      }
    } catch (err) {
      setErrorMessage(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goBackToPhone = () => {
    setStep("phone");
    setMode(null);
    setPassword("");
    setOtpCode("");
    setErrorMessage("");
    setResendTimer(0);
  };

  const stepTitle =
    step === "phone" ? "ورود به حساب کاربری" : step === "password" ? "ورود با رمز عبور" : "تایید کد احراز هویت";

  const stepSubtitle =
    step === "phone"
      ? "برای ورود یا ثبت‌نام، شماره موبایل خود را وارد کنید."
      : step === "password"
      ? `رمز عبور مربوط به شماره ${mobile} را وارد کنید.`
      : `کد تایید ۶ رقمی به شماره ${mobile} ارسال شد.`;

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0b0b0c] px-4 py-10">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#CD9F63]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#CD9F63]/5 blur-[120px]" />
      <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full bg-linear-to-r from-transparent via-[#CD9F63]/10 to-transparent" />

      <div className="relative z-10 w-full max-w-[430px]">
        <div className="rounded-3xl border border-white/10 bg-[#151516]/80 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-9">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">{stepTitle}</h1>
            <p className="mt-3 text-sm leading-6 text-gray-500">{stepSubtitle}</p>
            {step === "otp" && devHint && (
              <div className="mt-2 inline-block rounded-lg bg-[#CD9F63]/10 px-3 py-1 text-xs text-[#CD9F63]">
                کد تست برای شما: <b>{devHint}</b>
              </div>
            )}
          </div>

          {/* --- مرحله‌ی شماره موبایل --- */}
          {step === "phone" && (
            <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-right text-sm text-gray-400">شماره موبایل</label>
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

              {errorMessage && <p className="text-xs text-red-400 text-right">{errorMessage}</p>}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#CD9F63] py-3.5 text-sm font-bold text-[#111111] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#dcb078] hover:shadow-[0_10px_30px_rgba(205,159,99,0.18)] disabled:opacity-50"
              >
                {loading ? "در حال بررسی..." : "ادامه"}
                {!loading && <FaArrowLeft className="text-xs transition-transform duration-300 group-hover:-translate-x-1" />}
              </button>
            </form>
          )}

          {/* --- مرحله‌ی رمز عبور (کاربرانی که قبلاً ثبت‌نام کرده‌اند) --- */}
          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
              <div>
                <label className="mb-2 flex items-center justify-between text-sm text-gray-400">
                  <button type="button" onClick={goBackToPhone} className="text-xs text-[#CD9F63] hover:underline">
                    ویرایش شماره
                  </button>
                  <span>رمز عبور</span>
                </label>
                <div className="group flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f0f10] px-4 py-3 transition-all duration-300 focus-within:border-[#CD9F63]/70 focus-within:shadow-[0_0_20px_rgba(205,159,99,0.08)]">
                  <FaLock className="shrink-0 text-[#CD9F63]" />
                  <input
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    className="w-full bg-transparent text-left text-sm text-white outline-none placeholder:text-gray-600"
                    type="password"
                    placeholder="رمز عبور خود را وارد کنید"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              {errorMessage && <p className="text-xs text-red-400 text-right">{errorMessage}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#CD9F63] py-3.5 text-sm font-bold text-[#111111] transition-all duration-300 hover:bg-[#dcb078] disabled:opacity-50"
              >
                {loading ? "در حال ورود..." : "ورود"}
              </button>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-center text-xs text-gray-500 hover:text-[#CD9F63] hover:underline"
              >
                رمز عبور خود را فراموش کرده‌اید؟
              </button>
            </form>
          )}

          {/* --- مرحله‌ی کد تایید (ثبت‌نام یا فراموشی پسورد) --- */}
          {step === "otp" && (
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
              <div>
                <label className="mb-2 flex items-center justify-between text-sm text-gray-400">
                  <button type="button" onClick={goBackToPhone} className="text-xs text-[#CD9F63] hover:underline">
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

              {errorMessage && <p className="text-xs text-red-400 text-right">{errorMessage}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#CD9F63] py-3.5 text-sm font-bold text-[#111111] transition-all duration-300 hover:bg-[#dcb078] disabled:opacity-50"
              >
                {loading ? "در حال بررسی..." : "تایید و ادامه"}
              </button>

              <button
                type="button"
                onClick={sendOtp}
                disabled={loading || resendTimer > 0}
                className="text-center text-xs text-gray-500 hover:text-[#CD9F63] hover:underline disabled:cursor-not-allowed disabled:text-gray-700 disabled:no-underline"
              >
                {resendTimer > 0
                  ? `ارسال مجدد کد تا ${Math.floor(resendTimer / 60)}:${String(resendTimer % 60).padStart(2, "0")} دیگر`
                  : "ارسال مجدد کد تایید"}
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