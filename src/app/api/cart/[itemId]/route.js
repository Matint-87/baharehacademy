import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// تغییر تعداد یک آیتم توی سبد خرید
export async function PATCH(request, { params }) {
  const auth = await requireUser();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { itemId } = await params;
    const body = await request.json();
    const quantity = parseInt(body.quantity, 10);

    if (isNaN(quantity) || quantity < 1) {
      return NextResponse.json({ success: false, error: "تعداد نامعتبر است" }, { status: 400 });
    }

    // چک مالکیت + چک موجودی + آپدیت همه داخل یک تراکنش، تا بین خواندن موجودی
    // و آپدیت quantity، درخواست دیگه‌ای موجودی رو عوض نکنه
    const updated = await prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true, product: true, course: true },
      });

      // چک می‌کنیم آیتم واقعاً متعلق به سبد خودِ همین کاربره
      if (!cartItem || cartItem.cart.userId !== auth.user.id) {
        throw new Error("NOT_FOUND");
      }

      if (cartItem.itemType === "COURSE" && quantity !== 1) {
        throw new Error("INVALID_COURSE_QTY");
      }

      if (cartItem.itemType === "PRODUCT" && cartItem.product && quantity > cartItem.product.stock) {
        throw new Error("STOCK_EXCEEDED");
      }

      return tx.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    });

    return NextResponse.json({ success: true, cartItem: updated });
  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return NextResponse.json({ success: false, error: "آیتم یافت نشد" }, { status: 404 });
    }
    if (error.message === "INVALID_COURSE_QTY") {
      return NextResponse.json({ success: false, error: "تعداد دوره همیشه ۱ است" }, { status: 400 });
    }
    if (error.message === "STOCK_EXCEEDED") {
      return NextResponse.json(
        { success: false, error: "تعداد درخواستی بیشتر از موجودی است" },
        { status: 400 }
      );
    }
    console.error("Error updating cart item:", error);
    return NextResponse.json({ success: false, error: "خطا در ویرایش سبد خرید" }, { status: 500 });
  }
}

// حذف یک آیتم از سبد خرید
export async function DELETE(request, { params }) {
  const auth = await requireUser();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { itemId } = await params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== auth.user.id) {
      return NextResponse.json({ success: false, error: "آیتم یافت نشد" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json({ success: false, error: "خطا در حذف از سبد خرید" }, { status: 500 });
  }
}