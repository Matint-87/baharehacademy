import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
        addressDetail: true,
        postalCode: true,
        age: true,
        nationalCode: true,
        image: true,
        isAdmin: true,
        isVerified: true,
        password: true, 
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "کاربر یافت نشد" }, { status: 404 });
    }

    const userResponse = {
      ...user,
      hasPassword: Boolean(user.password), 
    };
    
    delete userResponse.password;

    return NextResponse.json({ success: true, user: userResponse });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}