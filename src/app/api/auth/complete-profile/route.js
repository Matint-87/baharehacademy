import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, isPasswordStrong, toSafeUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
    }

    const { firstName, lastName, address, postalCode, password } = await request.json();

    if (!firstName || !lastName || !address || !postalCode || !password) {
      return NextResponse.json({ error: "تمام فیلدها الزامی است." }, { status: 400 });
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

    const hashedPassword = await hashPassword(password);

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        firstName,
        lastName,
        addressDetail: address,
        postalCode,
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
    return NextResponse.json({ error: "خطای سرور در ذخیره اطلاعات رخ داد." }, { status: 500 });
  }
}