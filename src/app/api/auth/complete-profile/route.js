import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, isPasswordStrong, toSafeUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
    }

    const { firstName, lastName, addressDetail, postalCode, nationalCode, age, image, password } = await request.json();

    // بررسی فیلدهای اجباری
    if (!firstName || !lastName || !addressDetail || !postalCode || !password) {
      return NextResponse.json({ error: "تمام فیلدهای ستاره‌دار الزامی است." }, { status: 400 });
    }

    if (!isPasswordStrong(password)) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { id: session.userId } });

    if (!existingUser) {
      return NextResponse.json({ error: "کاربر یافت نشد." }, { status: 404 });
    }

    // جلوگیری از ثبت‌نام تکراری: اگه قبلاً پسورد ست شده، این حساب قبلاً تکمیل شده
    if (existingUser.password) {
      return NextResponse.json(
        { error: "شما قبلاً ثبت‌نام خود را تکمیل کرده‌اید. لطفاً از صفحه‌ی ورود اقدام کنید." },
        { status: 409 }
      );
    }

    // اصلاح مقدار کد ملی: اگر خالی بود تبدیل به null شود، در غیر این صورت بررسی تکراری نبودن
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

    const hashedPassword = await hashPassword(password);

    // به‌روزرسانی اطلاعات کاربر در دیتابیس با مدل جدید Prisma
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        firstName,
        lastName,
        addressDetail,
        postalCode,
        nationalCode: formattedNationalCode,
        age: age ? Number(age) : null,
        image: image && image.trim() !== "" ? image.trim() : null,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "ثبت‌نام شما با موفقیت تکمیل شد.",
      user: toSafeUser(updatedUser),
    });
  } catch (error) {
    console.error("Error in complete-profile:", error);
    
    // مدیریت خطای اختصاصی پراسما برای فیلد یکتا (Unique constraint)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "اطلاعات وارد شده (مانند کد ملی) تکراری است." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "خطای سرور در ذخیره اطلاعات رخ داد." }, { status: 500 });
  }
}