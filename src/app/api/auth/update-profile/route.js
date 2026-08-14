import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request) {
  try {
    // شناسه کاربر باید از سشن معتبر بیاد، نه از بدنه‌ی درخواست
    // (وگرنه هرکسی می‌تونه با فرستادن userId دلخواه، پروفایل بقیه رو تغییر بده)
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
    }

    const { firstName, lastName, address, postalCode } = await request.json();

    // اعتبارسنجی حداقلی ورودی‌ها
    if (!firstName || !lastName) {
      return NextResponse.json({ error: "نام و نام خانوادگی الزامی است." }, { status: 400 });
    }

    // به‌روزرسانی دقیق اطلاعات در دیتابیس - فقط برای کاربر همون سشن
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        firstName,
        lastName,
        addressDetail: address, // نام فیلد در دیتابیس شما
        postalCode,
      },
    });

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