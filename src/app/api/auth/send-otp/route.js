import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: "شماره موبایل الزامی است." }, { status: 400 });
    }

    // تولید یک کد تایید ۶ رقمی تصادفی
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // تاریخ انقضا: ۲ دقیقه بعد
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // ذخیره یا بروزرسانی کاربر در دیتابیس
    await prisma.user.upsert({
      where: { phoneNumber },
      update: {
        otpCode,
        otpExpiresAt,
      },
      create: {
        phoneNumber,
        otpCode,
        otpExpiresAt,
      },
    });

    // موقتاً کد را در کنسول یا پاسخ سرور می‌بینیم تا تست کنید
    console.log(`OTP Code for ${phoneNumber}: ${otpCode}`);

    return NextResponse.json({
      success: true,
      message: "کد تایید با موفقیت ارسال شد.",
      devOtpCode: otpCode, // برای تست راحت‌تر در محیط توسعه
    });
  } catch (error) {
    console.error("Error in send-otp:", error);
    return NextResponse.json({ error: "خطای سرور رخ داده است." }, { status: 500 });
  }
}