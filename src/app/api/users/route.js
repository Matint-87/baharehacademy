import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// گرفتن لیست کاربران با صفحه‌بندی واقعی (۹ تا ۹ تا)
export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const limit = 9;
  const skip = (page - 1) * limit;

  try {
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      success: true,
      users,
      totalCount,
      hasMore: skip + users.length < totalCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, users: [], error: "خطا در دریافت کاربران" }, { status: 500 });
  }
}

// ثبت کاربر جدید
export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ success: false, error: "نام و ایمیل الزامی است" }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "فرمت ایمیل نامعتبر است" }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: { name: name.trim(), email: email.trim() },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    // خطای یکتا بودن ایمیل (Prisma P2002)
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "این ایمیل قبلاً ثبت شده است" }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در ایجاد کاربر" }, { status: 500 });
  }
}

// ویرایش کاربر
export async function PUT(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, name, email } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "شناسه کاربر ارسال نشده است" }, { status: 400 });
    }
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ success: false, error: "نام و ایمیل الزامی است" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name: name.trim(), email: email.trim() },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "کاربر یافت نشد" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در ویرایش کاربر" }, { status: 500 });
  }
}

// حذف کاربر
export async function DELETE(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "شناسه کاربر ارسال نشده است" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "کاربر با موفقیت حذف شد" });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "کاربر یافت نشد" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در حذف کاربر" }, { status: 500 });
  }
}