import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId, firstName, lastName, address, postalCode } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "شناسه کاربر نامعتبر است." }, { status: 400 });
    }

    // ۱. به‌روزرسانی دقیق اطلاعات در دیتابیس پریسما
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        firstName,
        lastName,
        addressDetail: address, // نام فیلد در دیتابیس شما
        postalCode: postalCode, // مطمئن شوید نام فیلد در اسکیما همین است
      },
    });

    // ۲. ارسال ساختار کامل به فرانت‌اند تا در لوکال‌استوریج ذخیره شود
    return NextResponse.json({
      success: true,
      message: "پروفایل با موفقیت تکمیل شد.",
      user: {
        id: updatedUser.id,
        phoneNumber: updatedUser.phoneNumber,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        address: updatedUser.addressDetail, // مپ کردن به address برای فرانت‌اند
        postalCode: updatedUser.postalCode,
      },
    });
  } catch (error) {
    console.error("Error in update-profile:", error);
    return NextResponse.json({ error: "خطای سرور در ذخیره اطلاعات رخ داد." }, { status: 500 });
  }
}