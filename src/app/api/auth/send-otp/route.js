import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// الگوی ساده برای شماره موبایل ایران (۰۹xxxxxxxxx)
const IRAN_PHONE_REGEX = /^09\d{9}$/;

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber || !IRAN_PHONE_REGEX.test(phoneNumber)) {
      return NextResponse.json({ error: "شماره موبایل معتبر نیست." }, { status: 400 });
    }

    // --- محدودیت نرخ درخواست (Rate Limiting) ---
    // جلوگیری از اسپم پیامک: اگه کاربر قبلی هنوز OTP معتبر داره و کمتر از ۶۰ ثانیه گذشته، رد کن
    const existingUser = await prisma.user.findUnique({ where: { phoneNumber } });

    if (existingUser?.otpLastSentAt) {
      const secondsSinceLastSend = (Date.now() - existingUser.otpLastSentAt.getTime()) / 1000;
      if (secondsSinceLastSend < 60) {
        const waitTime = Math.ceil(60 - secondsSinceLastSend);
        return NextResponse.json(
          { error: `لطفاً ${waitTime} ثانیه دیگر دوباره تلاش کنید.` },
          { status: 429 }
        );
      }
    }

    // تولید یک کد تایید ۶ رقمی تصادفی
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // تاریخ انقضا: ۲ دقیقه بعد
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // ذخیره یا بروزرسانی کاربر در دیتابیس
    // نکته: otpAttempts رو صفر می‌کنیم تا شمارنده‌ی تلاش‌های ناموفق قبلی ریست بشه
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

    // TODO: اینجا باید به یک سرویس پیامک واقعی (مثل کاوه‌نگار / ملی‌پیامک) وصل بشه
    // await sendSms(phoneNumber, `کد تایید شما: ${otpCode}`);
    console.log(`[DEV ONLY] OTP Code for ${phoneNumber}: ${otpCode}`);

    // کد OTP هرگز نباید در پاسخ به کلاینت برگردونده بشه (حتی در dev بهتره فقط لاگ بشه)
    const isDev = process.env.NODE_ENV === "development";

    return NextResponse.json({
      success: true,
      message: "کد تایید با موفقیت ارسال شد.",
      ...(isDev ? { devOtpCode: otpCode } : {}),
    });
  } catch (error) {
    console.error("Error in send-otp:", error);
    return NextResponse.json({ error: "خطای سرور رخ داده است." }, { status: 500 });
  }
}