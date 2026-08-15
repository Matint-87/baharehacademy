"use client";

import { useEffect } from "react";

// این کامپوننت هیچ چیزی رندر نمی‌کنه؛ فقط یک بار بعد از لود صفحه چک می‌کنه
// که آیا کاربر لاگین‌کرده ولی هنوز پروفایلش (پسورد) رو تکمیل نکرده -
// اگه اینطور بود، می‌فرستدش به صفحه‌ی تکمیل پروفایل
export default function ProfileCompletionGuard() {
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/me");

        // اگه اصلاً سشن معتبر نداره (کاربر مهمونه) کاری نکن - صفحه‌ی اصلی برای همه بازه
        if (!res.ok) return;

        const data = await res.json();

        // کاربر سشن داره ولی هنوز پسورد ست نکرده یعنی وسط مسیر ثبت‌نامه
        if (isMounted && !data.user.hasPassword) {
          window.location.href = "/profile";
        }
      } catch (e) {
        // در صورت خطای شبکه، کاری انجام نمی‌دیم - کاربر می‌تونه صفحه رو ببینه
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}