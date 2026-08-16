import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, toSafeUser } from "@/lib/auth";

// برخلاف complete-profile، این روت رمز عبور رو دست نمی‌زنه
// و برای کاربرانی‌ه که از قبل ثبت‌نامشون کامل شده و می‌خوان اطلاعاتشون رو ویرایش کنن
export async function POST(request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
    }

    const { firstName, lastName, address, postalCode, age, nationalCode, image } = await request.json();

    if (!firstName || !lastName || !address || !postalCode) {
      return NextResponse.json({ error: "تمام فیلدها الزامی است." }, { status: 400 });
    }

    // کد ملی هم مثل complete-profile اختیاریه ولی اگه پر شده باشه باید یکتا باشه
    const formattedNationalCode = nationalCode && nationalCode.trim() !== "" ? nationalCode.trim() : null;

    if (formattedNationalCode) {
      const duplicateUser = await prisma.user.findUnique({
        where: { nationalCode: formattedNationalCode },
      });

      if (duplicateUser && duplicateUser.id !== session.userId) {
        return NextResponse.json(
          { error: "این کد ملی متعلق به کاربر دیگری است." },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        firstName,
        lastName,
        addressDetail: address,
        postalCode,
        age: age ? Number(age) : null,
        nationalCode: formattedNationalCode,
        image: image && image.trim() !== "" ? image.trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "اطلاعات با موفقیت به‌روزرسانی شد.",
      user: toSafeUser(updatedUser),
    });
  } catch (error) {
    console.error("Error in update-info:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "اطلاعات وارد شده (مانند کد ملی) تکراری است." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "خطای سرور رخ داد." }, { status: 500 });
  }
}