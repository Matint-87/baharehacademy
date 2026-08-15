import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "شناسه کاربر ارسال نشده است" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        loginAttempts: 0,
        loginLockedUntil: null,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Unlock User Error:", error);
    return NextResponse.json({ success: false, error: "خطا در باز کردن قفل حساب کاربر" }, { status: 500 });
  }
}