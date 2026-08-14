import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// این endpoint عمومیه (فروشگاه اصلی سایت هم ازش استفاده می‌کنه) - قفل ادمین نداره
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const limit = 9;
  const skip = (page - 1) * limit;

  try {
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      success: true,
      products,
      totalCount,
      hasMore: skip + products.length < totalCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, products: [], error: "خطا در دریافت محصولات" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { title, category, pricePerUnit, description, image } = body;

    if (!title?.trim() || !category?.trim()) {
      return NextResponse.json({ success: false, error: "عنوان و دسته‌بندی الزامی است" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        title: title.trim(),
        category: category.trim(),
        pricePerUnit: parseFloat(pricePerUnit) || 0,
        description,
        image,
      },
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در ایجاد محصول" }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, title, category, pricePerUnit, description, image } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "شناسه محصول ارسال نشده است" }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title,
        category,
        pricePerUnit: parseFloat(pricePerUnit) || 0,
        description,
        image,
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "محصول یافت نشد" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در ویرایش محصول" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "شناسه محصول ارسال نشده است" }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "محصول یافت نشد" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در حذف محصول" }, { status: 500 });
  }
}