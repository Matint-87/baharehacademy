import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 10;
    const skip = (page - 1) * limit;

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
    return NextResponse.json({ success: false, error: "خطا در دریافت محصولات" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newProduct = await prisma.product.create({
      data: {
        title: body.title,
        category: body.category,
        pricePerUnit: parseFloat(body.pricePerUnit),
        stock: parseInt(body.stock || 0, 10),
        step: parseInt(body.step || 100, 10),
        unitType: body.unitType || "gram",
        description: body.description,
        image: body.image,
      },
    });
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ success: false, error: "خطا در ایجاد محصول" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    
    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        category: data.category,
        pricePerUnit: parseFloat(data.pricePerUnit),
        stock: parseInt(data.stock, 10),
        step: parseInt(data.step, 10),
        unitType: data.unitType,
        description: data.description,
        image: data.image,
      },
    });
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "خطا در ویرایش محصول" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "خطا در حذف محصول" }, { status: 500 });
  }
}