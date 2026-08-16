import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const SAFE_USER_SELECT = {
  id: true,
  phoneNumber: true,
  firstName: true,
  lastName: true,
  image: true,
  addressDetail: true,
  postalCode: true,
  isVerified: true,
  isAdmin: true,
  loginAttempts: true,
  loginLockedUntil: true,
  createdAt: true,
  updatedAt: true,
};
export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error,
      },
      {
        status: auth.status,
      },
    );
  }
  const { searchParams } = new URL(request.url);
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = 9;
  const skip = (page - 1) * limit;
  try {
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: SAFE_USER_SELECT,
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
    console.error("GET /api/users error:", error);

    return NextResponse.json(
      {
        success: false,
        users: [],
        error: "خطا در دریافت کاربران",
      },
      {
        status: 500,
      },
    );
  }
}
export async function POST(request) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error,
      },
      {
        status: auth.status,
      },
    );
  }
  try {
    const body = await request.json();

    const {
      phoneNumber,
      firstName,
      lastName,
      addressDetail,
      postalCode,
      image,
      isAdmin,
      isVerified,
    } = body;

    if (!phoneNumber?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "شماره تلفن الزامی است",
        },
        {
          status: 400,
        },
      );
    }

    const newUser = await prisma.user.create({
      data: {
        phoneNumber: phoneNumber.trim(),
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        addressDetail: addressDetail?.trim() || null,
        postalCode: postalCode?.trim() || null,
        image: image?.trim() || null,
        isAdmin: typeof isAdmin === "boolean" ? isAdmin : false,
        isVerified: typeof isVerified === "boolean" ? isVerified : false,
      },
      select: SAFE_USER_SELECT,
    });
    return NextResponse.json(
      {
        success: true,
        user: newUser,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "این شماره تلفن قبلاً ثبت شده است",
        },
        {
          status: 409,
        },
      );
    }
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در ایجاد کاربر",
      },
      {
        status: 500,
      },
    );
  }
}
export async function PUT(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error,
      },
      {
        status: auth.status,
      },
    );
  }
  try {
    const body = await request.json();
    const {
      id,
      phoneNumber,
      firstName,
      lastName,
      addressDetail,
      postalCode,
      image,
      isAdmin,
      isVerified,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "شناسه کاربر ارسال نشده است",
        },
        {
          status: 400,
        },
      );
    }
    if (!phoneNumber?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "شماره تلفن الزامی است",
        },
        {
          status: 400,
        },
      );
    }
    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "شناسه کاربر نامعتبر است",
        },
        {
          status: 400,
        },
      );
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        phoneNumber: phoneNumber.trim(),
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        addressDetail: addressDetail?.trim() || null,
        postalCode: postalCode?.trim() || null,
        image: image?.trim() || null,
        ...(typeof isAdmin === "boolean" && {
          isAdmin,
        }),
        ...(typeof isVerified === "boolean" && {
          isVerified,
        }),
      },
      select: SAFE_USER_SELECT,
    });
    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: "کاربر یافت نشد",
        },
        {
          status: 404,
        },
      );
    }
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "این شماره تلفن متعلق به کاربر دیگری است",
        },
        {
          status: 409,
        },
      );
    }
    console.error("PUT /api/users error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در ویرایش کاربر",
      },
      {
        status: 500,
      },
    );
  }
}
export async function DELETE(request) {
  const auth = await requireAdmin();

  if (!auth.ok) {
    return NextResponse.json(
      {
        success: false,
        error: auth.error,
      },
      {
        status: auth.status,
      },
    );
  }
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  if (!idParam) {
    return NextResponse.json(
      {
        success: false,
        error: "شناسه کاربر ارسال نشده است",
      },
      {
        status: 400,
      },
    );
  }
  const userId = parseInt(idParam, 10);
  if (Number.isNaN(userId)) {
    return NextResponse.json(
      {
        success: false,
        error: "شناسه کاربر نامعتبر است",
      },
      {
        status: 400,
      },
    );
  }
  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "کاربر با موفقیت حذف شد",
    });
  } catch (error) {
    if (error?.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: "کاربر یافت نشد",
        },
        {
          status: 404,
        },
      );
    }
    console.error("DELETE /api/users error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در حذف کاربر",
      },
      {
        status: 500,
      },
    );
  }
}
