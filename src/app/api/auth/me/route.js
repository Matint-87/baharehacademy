import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, toSafeUser } from "@/lib/auth";

// چون کوکی سشن httpOnly هست، فرانت نمی‌تونه مستقیم بخونتش
// این روت به صفحاتی مثل پروفایل و ریست‌پسورد اجازه می‌ده وضعیت سشن رو چک کنن
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: "وارد نشده‌اید." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد." }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: toSafeUser(user) });
  } catch (error) {
    console.error("Error in me:", error);
    return NextResponse.json({ error: "خطای سرور رخ داد." }, { status: 500 });
  }
}