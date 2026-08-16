import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      take: 9,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { success: true, data: courses },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching latest courses:", error);
    return NextResponse.json(
      { success: false, message: "خطایی در دریافت دوره‌ها رخ داد" },
      { status: 500 }
    );
  }
}