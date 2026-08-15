import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const IRAN_PHONE_REGEX = /^09\d{9}$/;

// فاصله‌ی مجاز بین دو درخواست ارسال کد - با زمان انقضای کد (۲ دقیقه) هماهنگه
const RESEND_COOLDOWN_SECONDS = 120;

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber || !IRAN_PHONE_REGEX.test(phoneNumber)) {
      return NextResponse.json({ error: "شماره موبایل معتبر نیست." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { phoneNumber } });

    // جلوگیری از اسپم پیامک
    if (existingUser?.otpLastSentAt) {
      const secondsSinceLastSend = (Date.now() - existingUser.otpLastSentAt.getTime()) / 1000;
      if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
        const waitTime = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend);
        return NextResponse.json(
          { error: `لطفاً ${waitTime} ثانیه دیگر دوباره تلاش کنید.`, waitTime },
          { status: 429 }
        );
      }
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);

    await prisma.user.upsert({
      where: { phoneNumber },
      update: {
        otpCode,
        otpExpiresAt,
        otpLastSentAt: new Date(),
        otpAttempts: 0,
      },
      create: {
        phoneNumber,
        otpCode,
        otpExpiresAt,
        otpLastSentAt: new Date(),
        otpAttempts: 0,
      },
    });

    // TODO: اتصال به سرویس پیامک واقعی (کاوه‌نگار / ملی‌پیامک و ...)
    console.log(`[DEV ONLY] OTP Code for ${phoneNumber}: ${otpCode}`);

    const isDev = process.env.NODE_ENV === "development";

    return NextResponse.json({
      success: true,
      message: "کد تایید با موفقیت ارسال شد.",
      resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
      ...(isDev ? { devOtpCode: otpCode } : {}),
    });
  } catch (error) {
    console.error("Error in send-otp:", error);
    return NextResponse.json({ error: "خطای سرور رخ داده است." }, { status: 500 });
  }
}