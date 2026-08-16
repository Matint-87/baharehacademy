import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET() {
  try {
    const products = await prisma.product.findMany({
      take: 9,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      { success: true, data: products },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching latest products:", error);
    return NextResponse.json(
      { success: false, message: "خطایی در دریافت محصولات رخ داد" },
      { status: 500 }
    );
  }
}