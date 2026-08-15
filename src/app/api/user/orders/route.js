import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // مسیر فایل پرایزما در پروژه شما

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "شناسه کاربر ارسال نشده است" },
        { status: 400 }
      );
    }

    // جستجوی سفارشات کاربر در دیتابیس (اصلاح فاصله بین await و prisma)
    const orders = await prisma.order.findMany({
      where: { 
        userId: Number(userId) // اگر فیلد userId در دیتابیس شما از نوع String است، متد Number را بردارید
      },
      include: {
        items: {
          include: {
            product: true,
            course: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("API Orders Error:", error);
    return NextResponse.json(
      { success: false, error: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}