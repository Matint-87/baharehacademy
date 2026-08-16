import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth"; // این خط جا افتاده بود

// سفارشات کاربر لاگین‌کرده - همیشه از روی سشن، هرگز از روی userId ارسالی کلاینت
export async function GET(request) {
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json(
      { success: false, error: "ابتدا وارد حساب کاربری خود شوید." },
      { status: 401 }
    );
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: session.userId,
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
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { success: false, error: "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}