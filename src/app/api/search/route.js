import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ success: true, courses: [], products: [], recipe: [] });
  }

  try {
    const [courses, products, recipe] = await Promise.all([
      prisma.course.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { instructor: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.recipe.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({ success: true, courses, products, recipe });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ success: false, error: "خطا در سرچ اطلاعات" }, { status: 500 });
  }
}