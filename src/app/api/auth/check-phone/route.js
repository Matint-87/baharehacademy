import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const IRAN_PHONE_REGEX = /^09\d{9}$/;

// این روت مشخص می‌کنه با این شماره باید مسیر «ثبت‌نام با OTP» طی بشه
// یا مسیر «ورود با پسورد»
export async function POST(request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber || !IRAN_PHONE_REGEX.test(phoneNumber)) {
      return NextResponse.json({ error: "شماره موبایل معتبر نیست." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      select: { password: true },
    });

    return NextResponse.json({
      success: true,
      hasPassword: !!user?.password,
    });
  } catch (error) {
    console.error("Error in check-phone:", error);
    return NextResponse.json({ error: "خطای سرور رخ داده است." }, { status: 500 });
  }
}