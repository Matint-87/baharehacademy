import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ۱. دریافت سفارشات (مورد استفاده در پنل ادمین)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "شناسه کاربر ارسال نشده است" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: Number(userId) }, // اگر id در دیتابیس شما عدد است Number بگذارید، اگر رشته است بگذارید خود userId
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
    console.error("User Orders API Error:", error);
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}

// ۲. ثبت سفارش جدید (مورد استفاده در صفحه سبد خرید /cart)
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, items, recipientName, recipientPhone, shippingAddress, postalCode } = body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "اطلاعات سفارش ناقص است" }, { status: 400 });
    }

    // دریافت اطلاعات کاربر برای مقادیر پیش‌فرض
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    const finalRecipientName = recipientName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'کاربر مهمان';
    const finalRecipientPhone = recipientPhone || user?.phoneNumber || '09000000000';
    const finalShippingAddress = shippingAddress || 'آدرس پیش‌فرض';
    const finalPostalCode = postalCode || '0000000000';

    // محاسبه مبلغ کل و اطلاعات دوره‌ها
    const courses = await prisma.course.findMany({
      where: { id: { in: items } },
    });

    const totalAmount = courses.reduce((sum, course) => sum + course.price, 0);

    // ایجاد سفارش جدید و ثبت اقلام مرتبط با آن در دیتابیس مطابق با اسکیما
    const newOrder = await prisma.order.create({
      data: {
        userId: Number(userId),
        totalAmount,
        status: "PROCESSING",
        recipientName: finalRecipientName,
        recipientPhone: finalRecipientPhone,
        shippingAddress: finalShippingAddress,
        postalCode: finalPostalCode,
        items: {
          create: courses.map((course) => ({
            courseId: course.id,
            itemType: "COURSE", // مقدار اجباری در OrderItem
            titleSnapshot: course.title || "دوره آموزشی", // مقدار اجباری برای حفظ عنوان
            unitPrice: course.price,
            quantity: 1,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ success: false, error: "خطا در ثبت سفارش در پایگاه داده" }, { status: 500 });
  }
}

// ۳. ویرایش وضعیت سفارش (مورد استفاده در پنل ادمین)
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "اطلاعات ناقص است" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Order Update Error:", error);
    return NextResponse.json({ success: false, error: "خطا در ویرایش سفارش" }, { status: 500 });
  }
}