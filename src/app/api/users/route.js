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
    const { phoneNumber, firstName, lastName, addressDetail, postalCode, isAdmin, isVerified } = body;

    if (!phoneNumber?.trim()) {
      return NextResponse.json({ success: false, error: "شماره تلفن الزامی است" }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        phoneNumber: phoneNumber.trim(),
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        addressDetail: addressDetail?.trim() || null,
        postalCode: postalCode?.trim() || null,
        isAdmin: typeof isAdmin === "boolean" ? isAdmin : false,
        isVerified: typeof isVerified === "boolean" ? isVerified : false,
      },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    // خطای یکتا بودن شماره تلفن (Prisma P2002)
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "این شماره تلفن قبلاً ثبت شده است" }, { status: 409 });
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
    const { id, phoneNumber, firstName, lastName, addressDetail, postalCode, isAdmin, isVerified } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "شناسه کاربر ارسال نشده است" }, { status: 400 });
    }
    if (!phoneNumber?.trim()) {
      return NextResponse.json({ success: false, error: "شماره تلفن الزامی است" }, { status: 400 });
    }

    // تبدیل id به عدد صحیح چون نوع آن در اسکیما Int است
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "شناسه کاربر نامعتبر است" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phoneNumber: phoneNumber.trim(),
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        addressDetail: addressDetail?.trim() || null,
        postalCode: postalCode?.trim() || null,
        ...(typeof isAdmin === "boolean" && { isAdmin }),
        ...(typeof isVerified === "boolean" && { isVerified }),
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "کاربر یافت نشد" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "این شماره تلفن متعلق به کاربر دیگری است" }, { status: 409 });
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
  const idParam = searchParams.get("id");

  if (!idParam) {
    return NextResponse.json({ success: false, error: "شناسه کاربر ارسال نشده است" }, { status: 400 });
  }

  const userId = parseInt(idParam, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ success: false, error: "شناسه کاربر نامعتبر است" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true, message: "کاربر با موفقیت حذف شد" });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "کاربر یافت نشد" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در حذف کاربر" }, { status: 500 });
  }
}