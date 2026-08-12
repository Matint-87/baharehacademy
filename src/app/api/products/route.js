import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const products = await prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.product.count();

    return NextResponse.json({ 
      success: true, 
      products, 
      hasMore: skip + products.length < totalCount 
    });
  } catch (error) {
    return NextResponse.json({ error: "خطا در دریافت محصولات" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, category, pricePerUnit, description, image } = body;

    const newProduct = await prisma.product.create({
      data: {
        title,
        category,
        pricePerUnit: parseFloat(pricePerUnit) || 0,
        description,
        image,
      },
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "خطا در ایجاد محصول" }, { status: 500 });
  }
}

// اضافه کردن متد ویرایش (PUT)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, category, pricePerUnit, description, image } = body;

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
    return NextResponse.json({ error: "خطا در ویرایش محصول" }, { status: 500 });
  }
}

// اضافه کردن متد حذف (DELETE)
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطا در حذف محصول" }, { status: 500 });
  }
}