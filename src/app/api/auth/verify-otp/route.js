import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { phoneNumber, otpCode } = await request.json();

    // بررسی صحت کد OTP (کدهای منطق بررسی شما...)
    
    // پیدا کردن یا ایجاد کاربر در دیتابیس
    let user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { phoneNumber, isVerified: true },
      });
    }

    // بازگرداندن اطلاعات کامل کاربر (مپ کردن address_detail به address)
    return NextResponse.json({
      success: true,
      message: "ورود موفقیت‌آمیز بود.",
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.addressDetail, // تبدیل نام فیلد دیتابیس برای استفاده در فرانت
        postalCode: user.postalCode,
      },
    });

  } catch (error) {
    console.error("Error in verify-otp:", error);
    return NextResponse.json({ error: "خطای سرور رخ داد." }, { status: 500 });
  }
}