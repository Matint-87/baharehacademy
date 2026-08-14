import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// این endpoint عمومیه (فروشگاه اصلی سایت هم ازش استفاده می‌کنه) - قفل ادمین نداره
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const limit = 9;
  const skip = (page - 1) * limit;

  try {
    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          price: true,
          duration: true,
          instructor: true,
          description: true,
          image: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.count(),
    ]);

    return NextResponse.json({
      success: true,
      courses,
      totalCount,
      hasMore: skip + courses.length < totalCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, courses: [], error: "خطا در دریافت دوره‌ها" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { title, description, price, duration, instructor, image } = body;

    if (!title?.trim() || !instructor?.trim()) {
      return NextResponse.json({ success: false, error: "عنوان و مدرس الزامی است" }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: {
        title: title.trim(),
        description,
        price: parseFloat(price) || 0,
        duration,
        instructor: instructor.trim(),
        image,
      },
    });

    return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در ایجاد دوره" }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, title, description, price, duration, instructor, image } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "شناسه دوره ارسال نشده است" }, { status: 400 });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        price: parseFloat(price) || 0,
        duration,
        instructor,
        image,
      },
    });

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "دوره یافت نشد" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در ویرایش دوره" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "شناسه دوره ارسال نشده است" }, { status: 400 });
  }

  try {
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "دوره یافت نشد" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در حذف دوره" }, { status: 500 });
  }
}