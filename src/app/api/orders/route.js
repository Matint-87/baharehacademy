import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/auth";

const PAGE_SIZE = 15;

// GET: فقط ادمین - لیست همه‌ی سفارش‌ها (صفحه‌بندی‌شده)
export async function GET(request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const skip = (page - 1) * PAGE_SIZE;

  try {
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true, phoneNumber: true } },
          items: true,
        },
      }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      totalCount,
      hasMore: skip + orders.length < totalCount,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "خطا در دریافت سفارش‌ها." }, { status: 500 });
  }
}

// POST: ثبت سفارش جدید توسط کاربر لاگین‌کرده (تسویه‌حساب سبد خرید)
// نکته‌ی امنیتی مهم: قیمت و موجودی هیچ‌وقت از کلاینت قبول نمی‌شه، همیشه از دیتابیس خونده می‌شه
export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید." }, { status: 401 });
  }

  try {
    const { items, deliveryMethod, recipientName, recipientPhone, shippingAddress, postalCode } =
      await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "سبد خرید خالی است." }, { status: 400 });
    }
    if (deliveryMethod !== "PICKUP" && deliveryMethod !== "COURIER") {
      return NextResponse.json({ error: "نحوه دریافت سفارش نامعتبر است." }, { status: 400 });
    }
    if (!recipientName || !recipientPhone) {
      return NextResponse.json({ error: "اطلاعات گیرنده کامل نیست." }, { status: 400 });
    }
    // آدرس و کد پستی فقط برای ارسال با پیک الزامی‌ان؛ در تحویل حضوری لازم نیستن
    if (deliveryMethod === "COURIER" && (!shippingAddress || !postalCode)) {
      return NextResponse.json(
        { error: "آدرس و کد پستی برای ارسال با پیک الزامی است." },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const cartItem of items) {
        if (cartItem.itemType === "PRODUCT") {
          const product = await tx.product.findUnique({ where: { id: cartItem.productId } });
          if (!product) throw new Error("یکی از محصولات سبد خرید دیگر موجود نیست.");
          if (product.stock < cartItem.quantity) {
            throw new Error(`موجودی «${product.title}» کافی نیست (موجودی فعلی: ${product.stock}).`);
          }

          await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: cartItem.quantity } },
          });

          // نکته: فیلد قیمت تو مدل Product اسمش «price» هست، نه «pricePerUnit»
          totalAmount += product.price * cartItem.quantity;
          orderItemsData.push({
            itemType: "PRODUCT",
            productId: product.id,
            titleSnapshot: product.title,
            quantity: cartItem.quantity,
            unitPrice: product.price,
          });
        } else if (cartItem.itemType === "COURSE") {
          const course = await tx.course.findUnique({ where: { id: cartItem.courseId } });
          if (!course) throw new Error("یکی از دوره‌های سبد خرید دیگر موجود نیست.");

          totalAmount += course.price;
          orderItemsData.push({
            itemType: "COURSE",
            courseId: course.id,
            titleSnapshot: course.title,
            quantity: 1,
            unitPrice: course.price,
          });
        } else {
          throw new Error("نوع آیتم سبد خرید نامعتبر است.");
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: session.userId,
          totalAmount,
          deliveryMethod,
          recipientName,
          recipientPhone,
          shippingAddress: deliveryMethod === "COURIER" ? shippingAddress : null,
          postalCode: deliveryMethod === "COURIER" ? postalCode : null,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      // خالی کردن سبد خرید کاربر بعد از ثبت موفق سفارش
      await tx.cart.deleteMany({ where: { userId: session.userId } });

      return createdOrder;
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message || "خطا در ثبت سفارش." }, { status: 400 });
  }
}