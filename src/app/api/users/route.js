import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// گرفتن لیست کاربران
export async function GET() {
  try {
    const users = await prisma.user ? await prisma.user.findMany() : [];
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: true, users: [] });
  }
}

// ثبت کاربر جدید
export async function POST(request) {
  try {
    const body = await request.json();
    const newUser = await prisma.user.create({
      data: { name: body.name, email: body.email },
    });
    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "خطا در ایجاد کاربر" }, { status: 500 });
  }
}

// حذف کاربر
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "خطا در حذف کاربر" }, { status: 500 });
  }
}