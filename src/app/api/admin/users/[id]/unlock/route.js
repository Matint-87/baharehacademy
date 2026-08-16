import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const { id } = await params;
    await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: { loginAttempts: 0, loginLockedUntil: null },
    });

    return NextResponse.json({ success: true, message: "حساب کاربر با موفقیت باز شد." });
  } catch (error) {
    console.error("Error unlocking user:", error);
    return NextResponse.json({ error: "خطا در بازکردن قفل حساب." }, { status: 500 });
  }
}