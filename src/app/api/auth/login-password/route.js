import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword, toSafeUser } from "@/lib/auth";

const IRAN_PHONE_REGEX = /^09\d{9}$/;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

export async function POST(request) {
  try {
    const { phoneNumber, password } = await request.json();

    if (!phoneNumber || !IRAN_PHONE_REGEX.test(phoneNumber) || !password) {
      return NextResponse.json({ error: "شماره موبایل و رمز عبور الزامی است." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "حساب کاربری با رمز عبور برای این شماره یافت نشد." },
        { status: 400 }
      );
    }

    // اگه حساب قفل موقت شده باشه
    if (user.loginLockedUntil && new Date() < user.loginLockedUntil) {
      const minutesLeft = Math.ceil((user.loginLockedUntil.getTime() - Date.now()) / 60000);
      return NextResponse.json(
        {
          error: `به‌دلیل تلاش‌های ناموفق زیاد، حساب شما موقتاً قفل شده. ${minutesLeft} دقیقه دیگر دوباره تلاش کنید یا از «فراموشی رمز عبور» استفاده کنید.`,
        },
        { status: 429 }
      );
    }

    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      const newAttempts = user.loginAttempts + 1;
      const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;

      await prisma.user.update({
        where: { phoneNumber },
        data: {
          loginAttempts: shouldLock ? 0 : newAttempts,
          loginLockedUntil: shouldLock
            ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000)
            : null,
        },
      });

      return NextResponse.json({ error: "رمز عبور اشتباه است." }, { status: 400 });
    }

    // ورود موفق -> ریست شمارنده‌ی تلاش‌های ناموفق
    const loggedInUser = await prisma.user.update({
      where: { phoneNumber },
      data: { loginAttempts: 0, loginLockedUntil: null },
    });

    await createSession(loggedInUser.id);

    return NextResponse.json({
      success: true,
      message: "ورود با موفقیت انجام شد!",
      user: toSafeUser(loggedInUser),
    });
  } catch (error) {
    console.error("Error in login-password:", error);
    return NextResponse.json({ error: "خطای سرور رخ داد." }, { status: 500 });
  }
}