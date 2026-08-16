import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword, isPasswordStrong } from "@/lib/auth";

export async function PATCH(request, { params }) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const { id } = await params;
    const { password } = await request.json();

    if (!isPasswordStrong(password)) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: { password: hashedPassword, loginAttempts: 0, loginLockedUntil: null },
    });

    return NextResponse.json({ success: true, message: "رمز عبور کاربر تغییر کرد." });
  } catch (error) {
    console.error("Error setting password:", error);
    return NextResponse.json({ error: "خطا در تغییر رمز عبور." }, { status: 500 });
  }
}