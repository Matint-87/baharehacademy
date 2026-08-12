// در یک فایل موقت مثل src/app/api/seed/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const data = Array.from({ length: 10 }).map((_, i) => ({
    title: `دوره تست ${i + 1}`,
    description: "توضیحات تستی برای این دوره.",
    price: 100000,
    duration: "۵ ساعت",
    instructor: "مدرس آزمایشی",
  }));

  await prisma.course.createMany({ data });
  return NextResponse.json({ message: "۱۰ دوره اضافه شد" });
}