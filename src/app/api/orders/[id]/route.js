import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const VALID_STATUSES = ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

// PATCH: تغییر وضعیت سفارش - فقط ادمین
export async function PATCH(request, { params }) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const { id } = await params; // در Next.js 16 باید await بشه
    const { status } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "وضعیت نامعتبر است." }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "سفارش یافت نشد." }, { status: 404 });
    }
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "خطا در به‌روزرسانی سفارش." }, { status: 500 });
  }
}