import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// دریافت لیست دوره‌ها
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "خطا در دریافت دوره‌ها" }, { status: 500 });
  }
}

// ایجاد دوره جدید
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, price, duration, instructor, image } = body;

    if (!title || !price || !instructor) {
      return NextResponse.json({ error: "لطفاً اطلاعات ضروری را وارد کنید." }, { status: 400 });
    }

    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        duration,
        instructor,
        image,
      },
    });

    return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "خطا در ایجاد دوره" }, { status: 500 });
  }
}