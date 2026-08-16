import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// دریافت سبد خرید کاربر لاگین‌کرده - همیشه از سرور خونده میشه، هیچ‌جا لوکال‌استوریج استفاده نمیشه
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: auth.user.id },
      include: {
        items: {
          include: { product: true, course: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ success: true, cart: { items: [], total: 0 } });
    }

    const total = cart.items.reduce((sum, item) => {
      const unitPrice = item.itemType === "PRODUCT" ? item.product?.price : item.course?.price;
      return sum + (unitPrice || 0) * item.quantity;
    }, 0);

    return NextResponse.json({ success: true, cart: { ...cart, total } });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ success: false, error: "خطا در دریافت سبد خرید" }, { status: 500 });
  }
}

// افزودن محصول یا دوره به سبد خرید
export async function POST(request) {
  const auth = await requireUser();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { itemType, productId, courseId, quantity } = body;

    if (itemType !== "PRODUCT" && itemType !== "COURSE") {
      return NextResponse.json({ success: false, error: "نوع آیتم نامعتبر است" }, { status: 400 });
    }

    // اعتبارسنجی و بررسی موجودی/وضعیت قبل از افزودن به سبد
    let product = null;
    let course = null;

    if (itemType === "PRODUCT") {
      if (!productId) {
        return NextResponse.json({ success: false, error: "شناسه محصول ارسال نشده است" }, { status: 400 });
      }
      product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({ success: false, error: "محصول یافت نشد" }, { status: 404 });
      }
      if (product.stock <= 0) {
        return NextResponse.json({ success: false, error: "این محصول ناموجود است" }, { status: 400 });
      }
    } else {
      if (!courseId) {
        return NextResponse.json({ success: false, error: "شناسه دوره ارسال نشده است" }, { status: 400 });
      }
      course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        return NextResponse.json({ success: false, error: "دوره یافت نشد" }, { status: 404 });
      }
      const isFinished = course.endDate ? new Date(course.endDate) < new Date() : false;
      if (isFinished) {
        return NextResponse.json(
          { success: false, error: "ثبت‌نام این دوره به پایان رسیده است" },
          { status: 400 }
        );
      }
    }

    const qty = itemType === "COURSE" ? 1 : Math.max(parseInt(quantity, 10) || 1, 1);

    // همه‌ی عملیات (پیدا/ساخت سبد + چک موجودی + آپدیت/ساخت آیتم) داخل یک تراکنش
    // تا زیر بار همزمان (race condition) موجودی رد نشه و quantity اشتباه محاسبه نشه
    const cartItem = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId: auth.user.id },
        create: { userId: auth.user.id },
        update: {},
      });

      const whereUnique =
        itemType === "PRODUCT"
          ? { cartId_productId: { cartId: cart.id, productId } }
          : { cartId_courseId: { cartId: cart.id, courseId } };

      const existingItem = await tx.cartItem.findUnique({ where: whereUnique }).catch(() => null);

      if (itemType === "PRODUCT") {
        const nextQty = existingItem ? existingItem.quantity + qty : qty;
        if (nextQty > product.stock) {
          throw new Error("STOCK_EXCEEDED");
        }
      }

      if (existingItem) {
        return tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: itemType === "COURSE" ? 1 : existingItem.quantity + qty },
        });
      }

      return tx.cartItem.create({
        data: {
          cartId: cart.id,
          itemType,
          productId: itemType === "PRODUCT" ? productId : null,
          courseId: itemType === "COURSE" ? courseId : null,
          quantity: qty,
        },
      });
    });

    return NextResponse.json({ success: true, cartItem }, { status: 201 });
  } catch (error) {
    if (error.message === "STOCK_EXCEEDED") {
      return NextResponse.json(
        { success: false, error: "تعداد درخواستی بیشتر از موجودی است" },
        { status: 400 }
      );
    }
    console.error("Error adding to cart:", error);
    return NextResponse.json({ success: false, error: "خطا در افزودن به سبد خرید" }, { status: 500 });
  }
}