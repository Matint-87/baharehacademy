import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, toSafeUser } from "@/lib/auth";

const MAX_ATTEMPTS = 5;

export async function POST(request) {
  try {
    const { phoneNumber, otpCode } = await request.json();

    if (!phoneNumber || !otpCode) {
      return NextResponse.json({ error: "شماره موبایل و کد تایید الزامی است." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json({ error: "کد تاییدی برای این شماره یافت نشد." }, { status: 400 });
    }

    // جلوگیری از حدس‌زدن مکرر کد (brute-force)
    if (user.otpAttempts >= MAX_ATTEMPTS) {
      await prisma.user.update({
        where: { phoneNumber },
        data: { otpCode: null, otpExpiresAt: null },
      });
      return NextResponse.json(
        { error: "تعداد تلاش‌های مجاز به پایان رسید. کد جدید درخواست کنید." },
        { status: 429 }
      );
    }

    if (new Date() > user.otpExpiresAt) {
      return NextResponse.json({ error: "کد تایید منقضی شده است." }, { status: 400 });
    }

    if (user.otpCode !== otpCode) {
      await prisma.user.update({
        where: { phoneNumber },
        data: { otpAttempts: { increment: 1 } },
      });
      return NextResponse.json({ error: "کد تایید نادرست است." }, { status: 400 });
    }

    // کد درست بود -> باطل کردن OTP (جلوگیری از replay attack)
    const verifiedUser = await prisma.user.update({
      where: { phoneNumber },
      data: {
        isVerified: true,
        otpCode: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    // صدور سشن (JWT در کوکی httpOnly)
    await createSession(verifiedUser.id);

    return NextResponse.json({
      success: true,
      message: "شماره موبایل با موفقیت تایید شد.",
      user: toSafeUser(verifiedUser), // شامل hasPassword برای تشخیص مسیر بعدی در فرانت
    });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json({ error: "خطای سرور رخ داد." }, { status: 500 });
  }
}