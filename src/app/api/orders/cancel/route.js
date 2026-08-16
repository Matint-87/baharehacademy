import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// وضعیت‌هایی که هنوز قابل لغو هستن (بعد از ارسال یا تحویل، دیگه نمی‌شه لغو کرد)
const CANCELLABLE_STATUSES = ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED"];

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  try {
    const { orderId, reason } = await request.json();

    if (!orderId || !reason?.trim()) {
      return NextResponse.json({ error: "دلیل لغو سفارش الزامی است." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "سفارش یافت نشد." }, { status: 404 });
    }

    // فقط صاحب سفارش می‌تونه لغوش کنه
    if (order.userId !== session.userId) {
      return NextResponse.json({ error: "شما اجازه‌ی لغو این سفارش را ندارید." }, { status: 403 });
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return NextResponse.json({ error: "این سفارش دیگر قابل لغو نیست." }, { status: 400 });
    }

    // لغو سفارش + برگردوندن موجودی محصولات به انبار، همه در یک تراکنش
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.itemType === "PRODUCT" && item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED", cancelReason: reason.trim() },
      });
    });

    return NextResponse.json({ success: true, message: "سفارش با موفقیت لغو شد." });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json({ error: "خطا در لغو سفارش." }, { status: 500 });
  }
}