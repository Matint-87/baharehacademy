import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const courses = await prisma.course.findMany({
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
    });

    const totalCount = await prisma.course.count();

    return NextResponse.json({ 
      success: true, 
      courses, 
      hasMore: skip + courses.length < totalCount 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "خطا در دریافت دوره‌ها" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, price, duration, instructor, image } = body;

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        price: parseFloat(price) || 0,
        duration,
        instructor,
        image,
      },
    });

    return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "خطا در ایجاد دوره" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, description, price, duration, instructor, image } = body;

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
    return NextResponse.json({ success: false, error: "خطا در ویرایش دوره" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  try {
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "خطا در حذف دوره" }, { status: 500 });
  }
}