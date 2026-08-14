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
    const [recipe, totalCount] = await Promise.all([
      prisma.recipe.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.recipe.count(),
    ]);

    return NextResponse.json({
      success: true,
      recipe,
      totalCount,
      hasMore: skip + recipe.length < totalCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, recipe: [], error: "خطا در دریافت دستور پخت‌ها" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { title, description, ingredients, instructions, prepTime, image } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: "عنوان الزامی است" }, { status: 400 });
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json({ success: false, error: "حداقل یک ماده لازم وارد کنید" }, { status: 400 });
    }

    const newRecipe = await prisma.recipe.create({
      data: {
        title: title.trim(),
        description,
        ingredients, // آرایه‌ای از مواد لازم
        instructions,
        prepTime,
        image,
      },
    });

    return NextResponse.json({ success: true, recipe: newRecipe }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در ایجاد دستور پخت" }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, title, description, ingredients, instructions, prepTime, image } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "شناسه دستور پخت ارسال نشده است" }, { status: 400 });
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        title,
        description,
        ingredients,
        instructions,
        prepTime,
        image,
      },
    });

    return NextResponse.json({ success: true, recipe: updatedRecipe });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "دستور پخت یافت نشد" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در ویرایش دستور پخت" }, { status: 500 });
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
    return NextResponse.json({ success: false, error: "شناسه دستور پخت ارسال نشده است" }, { status: 400 });
  }

  try {
    await prisma.recipe.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "دستور پخت با موفقیت حذف شد" });
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "دستور پخت یافت نشد" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: "خطا در حذف دستور پخت" }, { status: 500 });
  }
}