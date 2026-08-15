import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, isPasswordStrong, toSafeUser } from "@/lib/auth";

// این روت فقط بعد از تایید موفق OTP (یعنی سشن معتبر) قابل استفاده‌ست
// و برای تعیین رمز عبور جدید در مسیر «فراموشی رمز عبور» به‌کار می‌ره
export async function POST(request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: "ابتدا هویت خود را با کد تایید احراز کنید." }, { status: 401 });
    }

    const { password } = await request.json();

    if (!isPasswordStrong(password)) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        password: hashedPassword,
        loginAttempts: 0,
        loginLockedUntil: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "رمز عبور با موفقیت تغییر کرد.",
      user: toSafeUser(updatedUser),
    });
  } catch (error) {
    console.error("Error in set-password:", error);
    return NextResponse.json({ error: "خطای سرور رخ داد." }, { status: 500 });
  }
}