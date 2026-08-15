import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, toSafeUser } from "@/lib/auth";

// برخلاف complete-profile، این روت هیچ کاری با پسورد نداره
// و برای کاربرانی‌ه که از قبل ثبت‌نامشون کامل شده و می‌خوان اطلاعاتشون رو ویرایش کنن
export async function POST(request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
    }

    const { firstName, lastName, address, postalCode } = await request.json();

    if (!firstName || !lastName || !address || !postalCode) {
      return NextResponse.json({ error: "تمام فیلدها الزامی است." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        firstName,
        lastName,
        addressDetail: address,
        postalCode,
      },
    });

    return NextResponse.json({
      success: true,
      message: "اطلاعات با موفقیت به‌روزرسانی شد.",
      user: toSafeUser(updatedUser),
    });
  } catch (error) {
    console.error("Error in update-info:", error);
    return NextResponse.json({ error: "خطای سرور رخ داد." }, { status: 500 });
  }
}