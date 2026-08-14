import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params; // در Next.js جدید پارامترها ممکن است Promise باشند

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json({ success: false, error: "دوره پیدا نشد" }, { status: 404 });
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}