import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// لیست محصولات - عمداً بدون نیاز به لاگین (صفحه‌ی فروشگاه برای همه باید قابل مشاهده باشه)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
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

    // inStock رو صریح برمی‌گردونیم تا فرانت راحت دکمه‌ی افزودن به سبد رو مخفی/غیرفعال کنه
    const productsWithStockFlag = products.map((p) => ({
      ...p,
      inStock: p.stock > 0,
    }));

    return NextResponse.json({
      success: true,
      products: productsWithStockFlag,
      totalCount,
      hasMore: skip + products.length < totalCount,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ success: false, error: "خطا در دریافت محصولات" }, { status: 500 });
  }
}

// افزودن محصول - فقط ادمین
export async function POST(req) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();

    if (!body.title?.trim() || !body.category?.trim()) {
      return NextResponse.json({ success: false, error: "عنوان و دسته‌بندی الزامی است" }, { status: 400 });
    }

    const price = parseFloat(body.price);
    const stock = parseInt(body.stock ?? 0, 10);

    if (isNaN(price) || price < 0) {
      return NextResponse.json({ success: false, error: "قیمت نامعتبر است" }, { status: 400 });
    }
    if (isNaN(stock) || stock < 0) {
      return NextResponse.json({ success: false, error: "موجودی نامعتبر است" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        title: body.title.trim(),
        category: body.category.trim(),
        price,
        stock,
        description: body.description?.trim() || null,
        image: body.image || null,
      },
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ success: false, error: "خطا در ایجاد محصول" }, { status: 500 });
  }
}

// ویرایش محصول - فقط ادمین
export async function PUT(req) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "شناسه محصول ارسال نشده است" }, { status: 400 });
    }
    if (!data.title?.trim() || !data.category?.trim()) {
      return NextResponse.json({ success: false, error: "عنوان و دسته‌بندی الزامی است" }, { status: 400 });
    }

    const price = parseFloat(data.price);
    const stock = parseInt(data.stock, 10);

    if (isNaN(price) || price < 0) {
      return NextResponse.json({ success: false, error: "قیمت نامعتبر است" }, { status: 400 });
    }
    if (isNaN(stock) || stock < 0) {
      return NextResponse.json({ success: false, error: "موجودی نامعتبر است" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: data.title.trim(),
        category: data.category.trim(),
        price,
        stock,
        description: data.description?.trim() || null,
        image: data.image || null,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "محصول یافت نشد" }, { status: 404 });
    }
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, error: "خطا در ویرایش محصول" }, { status: 500 });
  }
}

// حذف محصول - فقط ادمین
export async function DELETE(req) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "شناسه محصول ارسال نشده است" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "محصول با موفقیت حذف شد" });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "محصول یافت نشد" }, { status: 404 });
    }
    console.error("Error deleting product:", error);
    return NextResponse.json({ success: false, error: "خطا در حذف محصول" }, { status: 500 });
  }
}